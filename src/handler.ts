import { App, Editor, MarkdownView, Notice } from "obsidian";
import { AIEditorSettings } from "src/settings";
import { UserAction } from "./action";
import { OpenAILLM } from "./llm/openai_llm";
import { LLMFactory } from "./llm/llm_factory";

export class ActionHandler {
    settings: AIEditorSettings;

    constructor(settings: AIEditorSettings) {
        this.settings = settings;
    }

    async process(
        app: App,
        settings: AIEditorSettings,
        action: UserAction,
        editor: Editor,
        view: MarkdownView
    ): Promise<void> {
        try {
            let text = this.getTextForAction(action, editor);
            if (text == undefined) {
                return;
            }

            const llm = LLMFactory.createLLM(
                settings.providerSettings,
                action.model.toString()
            );

            if (settings.testingMode) {
                this.processResult(
                    app,
                    action,
                    editor,
                    view,
                    "Testing mode: This is a test result"
                );
                return;
            }

            // Create modal
            const modal = this.createModal(app, action.modalTitle);

            // Process with streaming mode
            await llm.autocompleteStreaming(text, (text) => {
                modal.contentEl.innerText += text;
            });

            // Get result from modal
            const result = modal.contentEl.innerText;

            // Close modal
            modal.close();

            // Process result
            this.processResult(app, action, editor, view, result);
        } catch (error) {
            new Notice("Error: " + error.message);
            console.error(error);
        }
    }

    private getTextForAction(action: UserAction, editor: Editor): string {
        switch (action.sel) {
            case "CURSOR":
                return getSelectedText(editor);
            case "ALL":
                return getEditorText(editor);
            default:
                return "";
        }
    }

    private createModal(app: App, title: string) {
        const modal = new Modal(app);
        modal.titleEl.setText(title);
        modal.open();
        return modal;
    }

    private async processResult(
        app: App,
        action: UserAction,
        editor: Editor,
        view: MarkdownView,
        result: string
    ) {
        const formattedResult = action.format.replace("{{result}}", result);

        switch (action.loc) {
            case "INSERT_HEAD":
                editor.replaceRange(formattedResult, { line: 0, ch: 0 });
                break;
            case "APPEND_CURRENT":
                const cursor = editor.getCursor();
                editor.replaceRange(formattedResult, cursor);
                break;
            case "REPLACE_CURRENT":
                editor.replaceSelection(formattedResult);
                break;
            case "APPEND_BOTTOM":
                const lastLine = editor.lastLine();
                const lastLineContent = editor.getLine(lastLine);
                const insertPosition = {
                    line: lastLine,
                    ch: lastLineContent.length,
                };
                editor.replaceRange(formattedResult, insertPosition);
                break;
            case "APPEND_TO_FILE":
                if (action.locationExtra?.fileName) {
                    const targetFile = app.vault
                        .getFiles()
                        .find(
                            (file) =>
                                file.path === action.locationExtra?.fileName
                        );
                    if (targetFile) {
                        await app.vault.append(targetFile, formattedResult);
                    } else {
                        await app.vault.create(
                            action.locationExtra.fileName,
                            formattedResult
                        );
                    }
                }
                break;
        }
    }
}

export function getSelectedText(editor: Editor): string {
    if (!editor) {
        return "";
    }
    return editor.getSelection() || "";
}

export function getEditorText(editor: Editor): string {
    if (!editor) {
        return "";
    }
    return editor.getValue();
}

class Modal {
    app: App;
    titleEl: HTMLElement;
    contentEl: HTMLElement;

    constructor(app: App) {
        this.app = app;
        this.titleEl = document.createElement("div");
        this.contentEl = document.createElement("div");
    }

    open() {
        const modalContainer = document.createElement("div");
        modalContainer.className = "modal";
        modalContainer.style.position = "fixed";
        modalContainer.style.top = "50%";
        modalContainer.style.left = "50%";
        modalContainer.style.transform = "translate(-50%, -50%)";
        modalContainer.style.backgroundColor = "white";
        modalContainer.style.padding = "20px";
        modalContainer.style.borderRadius = "5px";
        modalContainer.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        modalContainer.style.zIndex = "1000";
        modalContainer.style.maxWidth = "80%";
        modalContainer.style.maxHeight = "80%";
        modalContainer.style.overflow = "auto";

        this.titleEl.style.fontWeight = "bold";
        this.titleEl.style.marginBottom = "10px";

        modalContainer.appendChild(this.titleEl);
        modalContainer.appendChild(this.contentEl);

        document.body.appendChild(modalContainer);
    }

    close() {
        const modal = document.querySelector(".modal");
        if (modal) {
            modal.remove();
        }
    }
}
