import { App, Modal, Setting } from "obsidian";

export class DeletionModal extends Modal {
	onDelete: () => void;

	constructor(app: App, onDelete: () => void) {
		super(app);
		this.onDelete = onDelete;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h1", { text: "Deletion" });

		contentEl.createEl("p", {
			text: "Are you sure about deleting custome action?",
		});

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText("Back to safety")
					.setCta()
					.onClick(() => {
						this.close();
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Delete")
					.setWarning()
					.onClick(() => {
						this.onDelete();
						this.close();
					});
			});
	}
}
