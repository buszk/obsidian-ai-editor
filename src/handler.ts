import { UserAction, Selection, Location } from "src/action";
import { ConfirmModal } from "src/confirm";
import { textCompletionStreaming } from "src/llm";
import { App, Editor, MarkdownView, Notice } from "obsidian";
import { AIEditorSettings } from "src/settings";

export class ActionHandler {
	constructor() {}

	getAPIKey(settings: AIEditorSettings) {
		const apiKey = settings.openAiApiKey;
		if (!apiKey) {
			new Notice("API key is not set in plugin settings");
			throw "API key not set";
		}
		return apiKey;
	}

	getTextInput(sel: Selection, editor: Editor) {
		if (sel == Selection.ALL) {
			return editor.getValue();
		} else if (Selection.CURSOR) {
			return editor.getSelection();
		} else {
			console.log(`Selection ${sel}`);
			throw "Selection not implemented";
		}
	}

	addToNote(loc: Location, text: string, editor: Editor) {
		if (loc == Location.INSERT_HEAD) {
			editor.setCursor(0, 0);
			editor.replaceRange(text, editor.getCursor());
		} else if (loc == Location.APPEND_BOTTOM) {
			editor.setCursor(editor.lastLine());
			editor.replaceRange(text, editor.getCursor());
		} else if (loc == Location.APPEND_CURRENT) {
			text = editor.getSelection() + text;
			editor.replaceSelection(text);
		} else if (loc == Location.REPLACE_CURRENT) {
			editor.replaceSelection(text);
		} else {
			throw "Location not implemented";
		}
	}

	async _textCompletionStreaming(
		prompt: string,
		text: string,
		apiKey: string,
		callback: (text: string) => void,
		testingMode: boolean = false
	) {
		let textCompleted = undefined;
		try {
			textCompleted = await textCompletionStreaming(
				prompt,
				text,
				apiKey,
				callback,
				testingMode
			);
		} catch (error) {
			console.error("Error calling text completion API: ", error);
			new Notice(
				"Error generating text. Please check the plugin console for details."
			);
		}
	}

	async process(
		app: App,
		settings: AIEditorSettings,
		action: UserAction,
		editor: Editor,
		view: MarkdownView
	) {
		console.log(editor.getSelection());
		const apiKey = this.getAPIKey(settings);
		const text = this.getTextInput(action.sel, editor);
		new Notice("Please wait... Querying OpenAI API...");

		const spinner = view.contentEl.createEl("div", { cls: "loader" });

		const modal = new ConfirmModal(
			app,
			action.modalTitle,
			(text: string) => action.format.replace("{{result}}", text),
			(result: string) => {
				this.addToNote(action.loc, result, editor);
			}
		);
		let modalDisplayed = false;
		await this._textCompletionStreaming(
			action.prompt,
			text,
			apiKey,
			(token) => {
				if (!modalDisplayed) {
					modalDisplayed = true;
					modal.open();
					spinner.remove();
				}
				modal.addToken(token);
			},
			settings.testingMode
		);
		spinner.remove();
	}
}
