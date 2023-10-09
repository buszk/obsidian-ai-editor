import { App, Modal, Setting } from "obsidian";
import {
	UserAction,
	selectionDictionary,
	Selection,
	Location,
	locationDictionary,
	modelDictionary,
} from "./action";
import { OpenAIModel } from "./llm/openai_llm";

export class ActionEditModal extends Modal {
	action: UserAction;
	onSave: (userAction: UserAction) => void;
	onDelete: () => void;

	constructor(
		app: App,
		user_action: UserAction,
		onSave: (userAction: UserAction) => void,
		onDelete: () => void
	) {
		super(app);
		this.action = user_action;
		this.onSave = onSave;
		this.onDelete = onDelete;
	}
	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h1", { text: "Edit Action" });

		this.createTextSetting(
			contentEl,
			"Action Name",
			"",
			this.action.name,
			async (value) => {
				this.action.name = value;
			}
		);

		new Setting(contentEl)
			.setName("LLM Model selection")
			.setDesc("What model would be used to process your input")
			.addDropdown((dropdown) => {
				if (this.action.model == undefined) {
					this.action.model = OpenAIModel.GPT_3_5;
				}
				dropdown
					.addOptions(modelDictionary())
					.setValue(this.action.model.toString())
					.onChange((value) => {
						this.action.model = value as OpenAIModel;
					});
			});

		this.createTextSetting(
			contentEl,
			"Prompt",
			"Prompt for LLM to process your input",
			this.action.prompt,
			async (value) => {
				this.action.prompt = value;
			}
		);
		this.createTextSetting(
			contentEl,
			"Output Format",
			"Format your LLM output. Use {{result}} as placeholder.",
			this.action.format,
			async (value) => {
				this.action.format = value;
			}
		);
		this.createTextSetting(
			contentEl,
			"Modal title",
			"Customize your confirmation window title",
			this.action.modalTitle,
			async (value) => {
				this.action.modalTitle = value;
			}
		);
		new Setting(contentEl)
			.setName("Input selection")
			.setDesc("What input would be sent to LLM?")
			.addDropdown((dropdown) => {
				if (this.action.sel == undefined) {
					this.action.sel = Selection.ALL;
				}
				console.log(this.action.sel.toString());
				dropdown
					.addOptions(selectionDictionary())
					.setValue(this.action.sel.toString())
					.onChange((value) => {
						this.action.sel =
							value as  Selection;
					});
			});
		new Setting(contentEl)
			.setName("Output location")
			.setDesc(
				"Where do you to put the generated output after formatting?"
			)
			.addDropdown((dropdown) => {
				if (this.action.loc == undefined) {
					this.action.loc = Location.INSERT_HEAD;
				}
				dropdown
					.addOptions(locationDictionary())
					.setValue(this.action.loc)
					.onChange((value) => {
						this.action.loc =
							value as  Location;
					});
			});

		new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText("Delete")
					.setWarning()
					.onClick(async () => {
						this.onDelete();
						this.close();
					});
			})
			.addButton((button) => {
				button
					.setButtonText("Save")
					.setCta()
					.onClick(async () => {
						await this.onSave(this.action);
						console.log(this.action);
						this.close();
					});
			});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}

	createTextSetting(
		containerEl: HTMLElement,
		name: string,
		desc: string,
		value: string,
		onSave: (newValue: string) => Promise<void>
	): void {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addTextArea((text) => {
				text.setValue(value).onChange(async (newValue) => {
					await onSave(newValue);
				});
			});
	}
}
