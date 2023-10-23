import { UserAction, Selection, Location } from "src/action";
import { OutputModal } from "src/modals/output";
import { App, Editor, MarkdownView, Notice, TFile, Vault } from "obsidian";
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
		switch (sel) {
			case Selection.ALL:
				return editor.getValue();
			case Selection.CURSOR:
				return editor.getSelection();
			default:
				console.log(`Selection ${sel}`);
				throw "Selection not implemented";
		}
	}

	async addToNote(
		location: Location,
		text: string,
		editor: Editor,
		vault?: Vault,
		locationExtra?: { fileName: string }
	) {
		switch (location) {
			case Location.INSERT_HEAD:
				editor.setCursor(0, 0);
				editor.replaceRange(text, editor.getCursor());
				break;
			case Location.APPEND_BOTTOM:
				editor.setCursor(editor.lastLine());
				editor.replaceRange(text, editor.getCursor());
				break;
			case Location.APPEND_CURRENT:
				text = editor.getSelection() + text;
				editor.replaceSelection(text);
				break;
			case Location.REPLACE_CURRENT:
				editor.replaceSelection(text);
				break;
			case Location.APPEND_TO_FILE:
				let fileName = locationExtra?.fileName;
				if (vault && fileName) {
					await this.appendToFileInVault(vault, fileName, text);
				}
				break;
			default:
				throw "Location not implemented";
		}
	}

	private async appendToFileInVault(
		vault: Vault,
		fileName: string,
		text: string
	) {
		let file: TFile = await getFile(vault, fileName);
		vault.append(file, text);
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

		const modal = new OutputModal(
			app,
			action.modalTitle,
			(text: string) => action.format.replace("{{result}}", text),
			async (result: string) => {
				await this.addToNote(
					action.loc,
					result,
					editor,
					view.file?.vault,
					action.locationExtra
				);
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

async function getFile(vault: Vault, fileName: string) {
	let file = vault.getAbstractFileByPath(fileName);
	if (file == null) {
		return await vault.create(fileName, "");
	} else if (file instanceof TFile) {
		return file;
	} else {
		throw "Not a file path";
	}
}
