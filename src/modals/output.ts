import { App, Modal, Setting } from "obsidian";

export class OutputModal extends Modal {
	title: string;
	format: (generated: string) => string;
	generated: string;
	editMode: boolean = false;

	onAccept:  (result: string) => Promise<void>;

	constructor(
		app: App,
		title: string,
		format: (generated: string) => string,
		onAccept:  (result: string) => Promise<void>,
		initial_text: string = ""
	) {
		super(app);
		this.onAccept = onAccept;
		this.title = title;
		this.format = format;
		this.generated = initial_text;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: this.title });
		contentEl.createEl("hr");

		let textEl: HTMLElement;
		if (this.editMode) {
			textEl = contentEl.createEl("textarea", {
				text: this.format(this.generated),
				attr: {
					style: "width: 100%",
					rows: "9",
					oninput: "this.innerHTML = this.value",
				},
			});
		} else {
			textEl = contentEl.createEl("p", {
				text: this.format(this.generated),
			});
		}
		contentEl.createEl("br");

		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Add to Note")
					.setCta()
					.onClick(async () => {
						this.close();
						await this.onAccept(textEl.innerText);
					})
			)
			.addButton((btn) =>
				btn.setButtonText("Edit").onClick(() => {
					this.editMode = true;
					this.onClose();
					this.onOpen();
				})
			)
			.addButton((btn) =>
				btn.setButtonText("Ignore").onClick(() => {
					this.close();
				})
			);
	}

	addToken(token: string) {
		this.generated = this.generated + token;
		this.contentEl.empty();
		this.onOpen();
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
