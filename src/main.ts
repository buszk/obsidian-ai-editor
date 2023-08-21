import { ActionHandler } from "src/handler";
import { Editor, MarkdownView, Plugin } from "obsidian";
import { AIEditorSettingTab, AIEditorSettings } from "src/settings";
import { DEFAULT_ACTIONS } from "src/preset";

const DEFAULT_SETTINGS: AIEditorSettings = {
	openAiApiKey: "",
	testingMode: false,
	customActions: DEFAULT_ACTIONS,
};

export default class AIEditor extends Plugin {
	settings: AIEditorSettings;

	async onload() {
		await this.loadSettings();

		let handler = new ActionHandler();

		this.settings.customActions.forEach((action) => {
			this.addCommand({
				id: `user-action-${action.name}`,
				name: `${action.name} user action`,
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					await handler.process(
						this.app,
						this.settings,
						action,
						editor,
						view
					);
				},
			});
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AIEditorSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
