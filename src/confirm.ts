import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
	title: string;
	format: (text: string) => string;
	text: string;

	onAccept: (result: string) => void;

	constructor(
		app: App,
		title: string,
		format: (text: string) => string,
		onAccept: (result: string) => void,
		initial_text: string = ""
	) {
		super(app);
		this.onAccept = onAccept;
		this.title = title;
		this.format = format;
		this.text = initial_text;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: this.title });
		contentEl.createEl("hr");
		contentEl.createEl("p", { text: this.format(this.text) });
		contentEl.createEl("br");

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Add to Note")
					.setCta()
					.onClick(() => {
						this.close();
						this.onAccept(this.format(this.text));
					})
			)
			.addButton((btn) =>
				btn.setButtonText("Ignore").onClick(() => {
					this.close();
				})
			);
	}

	addToken(token: string) {
		this.text = this.text + token;
		this.contentEl.empty();
		this.onOpen();
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
