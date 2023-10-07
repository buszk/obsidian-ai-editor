import { UserAction, Selection, Location } from "src/action";
import { ConfirmModal } from "src/confirm";
import { App, Editor, MarkdownView, Notice } from "obsidian";
import { AIEditorSettings } from "src/settings";
import { LLMFactory } from "./llm/factory";

export class ActionHandler {
	llmFactory: LLMFactory;

	constructor(settings: AIEditorSettings) {
		this.llmFactory = new LLMFactory(settings);
	}

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

	async process(
		app: App,
		settings: AIEditorSettings,
		action: UserAction,
		editor: Editor,
		view: MarkdownView
	) {
		console.log(editor.getSelection());
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
		try {
			const llm = this.llmFactory.createLLM(action);
			await llm.autocompleteStreaming(
				action.prompt + "\n" + text,
				(token) => {
					if (!modalDisplayed) {
						modalDisplayed = true;
						modal.open();
						spinner.remove();
					}
					modal.addToken(token);
				}
			);
		} catch (error) {
			console.log(error);
			new Notice(`Autocomplete error:\n${error}`);
		}
		spinner.remove();
	}
}
