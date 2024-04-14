import { App, PluginSettingTab, Setting } from "obsidian";
import {
	Location,
	Selection,
	UserAction,
	modelDictionary,
} from "src/action";
import AIEditor from "src/main";
import { Model } from "./llm/models";
import { OpenAIModel } from "./llm/openai_llm";
import { ActionEditModal } from "./modals/action_editor";


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
						this.plugin.saveSettings();
					})
					.setValue(this.plugin.settings.defaultModel.toString())
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
		cta = false
	): void {
		new Setting(containerEl).setName(name).addButton((button) => {
			button.setButtonText(buttonText).onClick(onClickHandler);
			if (cta) {
				button.setCta();
			}
		});
	}

	private displayActionEditModalForNewAction() {
		const DUMMY_ACTION: UserAction = {
			name: "Action Name",
			prompt: "Enter your prompt",
			sel: Selection.ALL,
			loc: Location.INSERT_HEAD,
			format: "{{result}}\n",
			modalTitle: "Check result",
			model: this.plugin.settings.defaultModel,
		};
		new ActionEditModal(
			this.app,
			this.plugin,
			DUMMY_ACTION,
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
			this.plugin,
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
