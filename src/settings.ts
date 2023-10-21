import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import AIEditor from "src/main";
import { UserAction, Selection, Location } from "src/action";
import { ActionEditModal } from "./action_editor";
import { OpenAIModel } from "./llm/openai_llm";

const DEFAULT_ACTION: UserAction = {
	name: "Action {{index}}",
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
				await this.createAction();
				this.display();
			}
		);
		containerEl.createEl("h1", { text: "Custom actions" });
		this.plugin.settings.customActions.forEach(
			(action: UserAction, index: number) => {
				this.displayAction(containerEl, action, index);
			}
		);
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

	displayAction(
		containerEl: HTMLElement,
		action: UserAction,
		index: number
	): void {
		this.createButton(containerEl, action.name, "Edit", async () => {
			const userAction = this.plugin.settings.customActions.at(index);
			if (userAction != undefined) {
				this.displayActionEditModal(userAction, index);
			}
		});
	}

	async createAction() {
		let newAction = { ...DEFAULT_ACTION };
		const rand = Math.floor(Math.random() * 999 + 1);
		newAction.name = newAction.name.replace("{{index}}", rand.toString());
		this.plugin.settings.customActions.push(newAction);
		await this.plugin.saveSettings();
		this.plugin.registerActions();
		this.displayActionEditModal(
			newAction,
			this.plugin.settings.customActions.length - 1
		);
	}

	private displayActionEditModal(userAction: UserAction, index: number) {
		new ActionEditModal(
			this.app,
			userAction,
			async (action: UserAction) => {
				this.plugin.settings.customActions[index] = action;
				await this.plugin.saveSettings();
				this.plugin.registerActions();
				this.display();
			},
			async () => {
				const actionToDelete =
					this.plugin.settings.customActions.at(index);
				if (actionToDelete != undefined) {
					this.plugin.settings.customActions.remove(actionToDelete);
					await this.plugin.saveSettings();
				}
				this.display();
			}
		).open();
	}
}
