import { ConfirmModal } from 'confirm';
import { textCompletion } from 'llm';
import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface AIEditorSettings {
	openAiApiKey: string;
	summaryHeading: string;
	summaryPrompt: string;
}

const DEFAULT_SETTINGS: AIEditorSettings = {
	openAiApiKey: '',
	summaryHeading: '**TL;DR**: ',
	summaryPrompt: 'Summarize the following in a paragraph'
}

export default class AIEditor extends Plugin {
	settings: AIEditorSettings;

	async onload() {
		await this.loadSettings();

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		let statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('AI');

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'ai-editor-tldr',
			name: 'TLDR command',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				const apiKey = this.settings.openAiApiKey;
				if (!apiKey) {
					new Notice("API key is not set in plugin settings");
					return;
				}
				const wholeText = editor.getValue()
				new Notice("Generating summary")
				let res = "";
				try {
					res = await textCompletion(this.settings.summaryPrompt, wholeText, apiKey)
				} catch (error) {
					console.error("Error calling text completion API: ", error);
					new Notice("Error generating text. Please check the plugin console for details.")
					return;
				}
				res = this.settings.summaryHeading + res + "\n"
				const modal = new ConfirmModal(this.app, "Check summary", res, () => {
					editor.setCursor(0, 0)
					editor.replaceRange(res, editor.getCursor())
				});
				modal.open();
			}
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

		new Setting(containerEl)
			.setName('Summary Prompt')
			.setDesc('Prompt used to generate a summary for the note')
			.addText(text => text
				.setPlaceholder('Enter your prompt')
				.setValue(this.plugin.settings.summaryPrompt)
				.onChange(async (value) => {
					this.plugin.settings.summaryPrompt = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Summary prefix')
			.setDesc('Prefix that put before the AI generated summary')
			.addText(text => text
				.setPlaceholder('Enter your prefix')
				.setValue(this.plugin.settings.summaryHeading)
				.onChange(async (value) => {
					this.plugin.settings.summaryHeading = value;
					await this.plugin.saveSettings();
				}))
	}
}
