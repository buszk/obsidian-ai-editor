import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import AIEditor from "src/main";
import { UserAction, Selection, Location } from "src/action";
import { ActionEditModal } from "./action_editor";
import { OpenAIModel } from "./llm/openai_llm";

const DEFAULT_ACTION: UserAction = {
	name: "Action Name",
	prompt: "Enter your prompt",
	sel: Selection.ALL,
	loc: Location.INSERT_HEAD,
	format: "{{result}}\n",
	modalTitle: "Check result",
	model: OpenAIModel.GPT_3_5,
};

export interface AIEditorSettings {
	openAiApiKey: string;
	testingMode: boolean;
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

		containerEl.createEl("h1", { text: "Common Settings" });

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
		this.createButton(
			containerEl,
			"Create custom action",
			"New",
			async () => {
				this.displayActionEditModalForNewAction();
			}
		);
		containerEl.createEl("h1", { text: "Custom actions" });

		for (let i = 0; i < this.plugin.settings.customActions.length; i++) {
			this.displayActionByIndex(containerEl, i);
		}
	}

	createButton(
		containerEl: HTMLElement,
		name: string,
		buttonText: string,
		onClickHandler: () => Promise<void>
	): void {
		new Setting(containerEl).setName(name).addButton((button) => {
			button.setButtonText(buttonText).onClick(onClickHandler);
		});
	}

	displayActionByIndex(containerEl: HTMLElement, index: number): void {
		const userAction = this.plugin.settings.customActions.at(index);
		if (userAction != undefined) {
			this.createButton(
				containerEl,
				userAction.name,
				"Edit",
				async () => {
					this.displayActionEditModalByActionAndIndex(
						userAction,
						index
					);
				}
			);
		}
	}

	private displayActionEditModalForNewAction() {
		new ActionEditModal(
			this.app,
			DEFAULT_ACTION,
			async (action: UserAction) => {
				this.plugin.settings.customActions.push(action);
				await this.saveSettingsAndRefresh();
			},
			() => {}
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
		this.display();
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
