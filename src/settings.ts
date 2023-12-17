import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import AIEditor from "src/main";
import {
	UserAction,
	Selection,
	Location,
	Model,
	modelDictionary,
} from "src/action";
import { ActionEditModal } from "./modals/action_editor";
import { OpenAIModel } from "./llm/openai_llm";

const DEFAULT_ACTION: UserAction = {
	name: "Action Name",
	prompt: "Enter your prompt",
	sel: Selection.ALL,
	loc: Location.INSERT_HEAD,
	format: "{{result}}\n",
	modalTitle: "Check result",
	model: OpenAIModel.GPT_3_5_TURBO_PREVIEW,
};

const DEFAULT_MODEL: Model = OpenAIModel.GPT_3_5_TURBO_PREVIEW;

export interface AIEditorSettings {
	openAiApiKey: string;
	testingMode: boolean;
	defaultModel: Model;
	customActions: Array<UserAction>;
}

export class AIEditorSettingTab extends PluginSettingTab {
	plugin: AIEditor;

	constructor(app: App, plugin: AIEditor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "General" });

		new Setting(containerEl).setName("OpenAI API Key").addText((text) =>
			text
				.setPlaceholder("Enter your API key")
				.setValue(this.plugin.settings.openAiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openAiApiKey = value;
					await this.plugin.saveSettings();
				})
		);
		new Setting(containerEl)
			.setName("Default LLM model")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(modelDictionary())
					.onChange((value) => {
						this.plugin.settings.defaultModel =
							value as OpenAIModel;
					})
					.setValue(DEFAULT_MODEL.toString())
			);
		new Setting(containerEl)
			.setName("Testing mode")
			.setDesc(
				"Use testing mode to test custom action without calling to OpenAI API"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.testingMode)
					.onChange(async (value) => {
						this.plugin.settings.testingMode = value;
						await this.plugin.saveSettings();
					})
			);
		containerEl.createEl("h1", { text: "Custom actions" });

		this.createButton(
			containerEl,
			"Create custom action",
			"New",
			() => {
				this.displayActionEditModalForNewAction();
			},
			true
		);

		for (let i = 0; i < this.plugin.settings.customActions.length; i++) {
			this.displayActionByIndex(containerEl, i);
		}
	}

	displayActionByIndex(containerEl: HTMLElement, index: number): void {
		const userAction = this.plugin.settings.customActions.at(index);
		if (userAction != undefined) {
			this.createButton(containerEl, userAction.name, "Edit", () => {
				this.displayActionEditModalByActionAndIndex(userAction, index);
			});
		}
	}

	createButton(
		containerEl: HTMLElement,
		name: string,
		buttonText: string,
		onClickHandler: () => void,
		cta: boolean = false
	): void {
		new Setting(containerEl).setName(name).addButton((button) => {
			button.setButtonText(buttonText).onClick(onClickHandler);
			if (cta) {
				button.setCta();
			}
		});
	}

	private displayActionEditModalForNewAction() {
		new ActionEditModal(
			this.app,
			DEFAULT_ACTION,
			async (action: UserAction) => {
				this.plugin.settings.customActions.push(action);
				await this.saveSettingsAndRefresh();
			},
			undefined
		).open();
	}

	private displayActionEditModalByActionAndIndex(
		userAction: UserAction,
		index: number
	) {
		new ActionEditModal(
			this.app,
			userAction,
			async (action: UserAction) => {
				await this.saveUserActionAndRefresh(index, action);
			},
			async () => {
				await this.deleteUserActionAndRefresh(index);
			}
		).open();
	}

	private async deleteUserActionAndRefresh(index: number) {
		const actionToDelete = this.plugin.settings.customActions.at(index);
		if (actionToDelete != undefined) {
			this.plugin.settings.customActions.remove(actionToDelete);
			await this.saveSettingsAndRefresh();
		}
	}

	private async saveUserActionAndRefresh(index: number, action: UserAction) {
		this.plugin.settings.customActions[index] = action;
		await this.saveSettingsAndRefresh();
	}

	private async saveSettingsAndRefresh() {
		await this.plugin.saveSettings();
		this.plugin.registerActions();
		this.display();
	}
}
