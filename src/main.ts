import { ActionHandler } from "src/handler";
import { Editor, MarkdownView, Plugin } from "obsidian";
import { AIEditorSettingTab, AIEditorSettings } from "src/settings";
import { DEFAULT_ACTIONS } from "src/preset";
import { UserAction } from "src/action";

const DEFAULT_SETTINGS: AIEditorSettings = {
	openAiApiKey: "",
	testingMode: false,
	customActions: DEFAULT_ACTIONS,
};

export default class AIEditor extends Plugin {
	settings: AIEditorSettings;

	registerActions() {
		let actions = this.settings.customActions;
		let handler = new ActionHandler(this.settings);
		actions.forEach((action, i) => {
			this.addCommand({
				// When user edit the settings, this method is called to updated command.
				// Use index as id to avoid creating duplicates
				id: `user-action-${i}`,
				name: action.name,
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
	}

	async onload() {
		await this.loadSettings();
		this.addCommand({
			id: "reload-commands",
			name: "Reload commands",
			callback: () => {
				this.registerActions();
			},
		});
		this.registerActions();

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
