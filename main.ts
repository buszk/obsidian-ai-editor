import { ConfirmModal } from 'confirm';
import { ActionHandler } from 'handler';
import { textCompletion } from 'llm';
import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { UserAction, Selection, Location } from 'action';
import { AIEditorSettingTab, AIEditorSettings } from 'settings';



const TLDR_ACTION: UserAction = {
	name: 'TLDR',
	prompt: 'Summarize the following in a paragraph',
	sel: Selection.ALL,
	loc: Location.HEAD,
	format: "**TL;DR**: {{result}}\n\n",
	modalTitle: "Check summary"
}

const DEFAULT_SETTINGS: AIEditorSettings = {
	openAiApiKey: '',
	customActions: [
		TLDR_ACTION,
	]
}

export default class AIEditor extends Plugin {
	settings: AIEditorSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		let statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('AI');
		let handler = new ActionHandler();

		this.settings.customActions.forEach((action) => {
			this.addCommand({
				id: `user-action-${action}`,
				name: `${action.name} user action`,
				editorCallback: async (editor: Editor, view: MarkdownView) => {
					await handler.process(this.app, this.settings, action, editor, view)
				}
			})
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AIEditorSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
