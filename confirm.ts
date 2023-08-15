import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
    title: string;
    text: string;

    onAccept: () => void;

    constructor(app: App, title: string, text: string, onAccept: () => void) {
        super(app);
        this.onAccept = onAccept;
        this.title = title;
        this.text = text;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: this.title });
        contentEl.createEl("hr");
        contentEl.createEl("p", { text: this.text });
        contentEl.createEl("br");


        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Add to Note")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onAccept();
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText("Ignore")
                    .onClick(() => {
                        this.close();
                    }))
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
