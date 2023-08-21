import { UserAction, Selection, Location } from "src/action";
import { ConfirmModal } from "src/confirm";
import { textCompletion } from "src/llm";
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

	async _textCompletion(
		prompt: string,
		text: string,
		apiKey: string,
		testingMode: boolean = false
	): Promise<string | undefined> {
		let textCompleted = undefined;
		try {
			textCompleted = await textCompletion(
				prompt,
				text,
				apiKey,
				testingMode
			);
		} catch (error) {
			console.error("Error calling text completion API: ", error);
			new Notice(
				"Error generating text. Please check the plugin console for details."
			);
		}
		return textCompleted;
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
		const textCompleted = await this._textCompletion(
			action.prompt,
			text,
			apiKey,
			settings.testingMode
		);
		if (textCompleted) {
			const result = action.format.replace("{{result}}", textCompleted);
			const modal = new ConfirmModal(
				app,
				action.modalTitle,
				result,
				() => {
					this.addToNote(action.loc, result, editor);
				}
			);
			modal.open();
		}
	}
}
