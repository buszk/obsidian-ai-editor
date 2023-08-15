import { ConfirmModal } from 'confirm';
import { ActionHandler } from 'handler';
import { textCompletion } from 'llm';
import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { UserAction, Selection, Location } from 'action';


export interface AIEditorSettings {
	openAiApiKey: string;
	customActions: Array<UserAction>;
}

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

class AIEditorSettingTab extends PluginSettingTab {
	plugin: AIEditor;

	constructor(app: App, plugin: AIEditor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('OpenAI API Key')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.openAiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openAiApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}
