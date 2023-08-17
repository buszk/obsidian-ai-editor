import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import AIEditor from "main";
import {
	UserAction,
	Selection,
	Location,
	locationDictionary,
	selectionDictionary,
} from "action";

const DEFAULT_ACTION: UserAction = {
	name: "Action {{index}}",
	prompt: "Enter your prompt",
	sel: Selection.ALL,
	loc: Location.HEAD,
	format: "{{result}}\n",
	modalTitle: "Check result",
};

export interface AIEditorSettings {
	openAiApiKey: string;
	customActions: Array<UserAction>;
}

export class AIEditorSettingTab extends PluginSettingTab {
	plugin: AIEditor;

	constructor(app: App, plugin: AIEditor) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("OpenAI API Key")
			.setDesc("OpenAI API Key")
			.addText((text) =>
				text
					.setPlaceholder("Enter your API key")
					.setValue(this.plugin.settings.openAiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.openAiApiKey = value;
						await this.plugin.saveSettings();
					})
			);
		this.createButton(
			containerEl,
			"Create custom action",
			"New",
			async () => {
				await this.createAction();
				this.display();
			}
		);
		this.plugin.settings.customActions.forEach((action, index) => {
			this.newAction(containerEl, action, index);
		});
	}

	async saveSetting<T extends keyof UserAction>(
		index: number,
		key: T,
		value: UserAction[T]
	): Promise<void> {
		this.plugin.settings.customActions[index][key] = value;
		await this.plugin.saveSettings();
	}

	createTextSetting(
		containerEl: HTMLElement,
		name: string,
		value: string,
		onSave: (newValue: string) => Promise<void>
	): void {
		new Setting(containerEl).setName(name).addTextArea((text) => {
			text.setValue(value).onChange(async (newValue) => {
				await onSave(newValue);
			});
		});
	}

	createButton(
		containerEl: HTMLElement,
		name: string,
		buttonText: string,
		onClickHandler: () => Promise<void>
	): void {
		new Setting(containerEl).setName(name).addButton((button) => {
			button.setButtonText(buttonText).onClick(onClickHandler);
		});
	}

	newAction(
		containerEl: HTMLElement,
		action: UserAction,
		index: number
	): void {
		this.createTextSetting(
			containerEl,
			`Action ${index}: Name`,
			action.name,
			async (value) => this.saveSetting(index, "name", value)
		);
		this.createTextSetting(
			containerEl,
			`Action ${index}: Prompt`,
			action.prompt,
			async (value) => this.saveSetting(index, "prompt", value)
		);
		this.createTextSetting(
			containerEl,
			`Action ${index}: Format`,
			action.format,
			async (value) => this.saveSetting(index, "format", value)
		);
		this.createTextSetting(
			containerEl,
			`Action ${index}: Modal title`,
			action.modalTitle,
			async (value) => this.saveSetting(index, "modalTitle", value)
		);
		new Setting(containerEl)
			.setName(`Action ${index}: Input selection`)
			.addDropdown((dropdown) => {
				dropdown
					.addOptions(selectionDictionary())
					.setValue(action.sel.toString())
					.onChange(async (value) => {
						this.plugin.settings.customActions[index].sel =
							Selection[value as keyof typeof Selection];
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName(`Action ${index}: Output location`)
			.addDropdown((dropdown) => {
				dropdown
					.addOptions(locationDictionary())
					.setValue(action.loc.toString())
					.onChange(async (value) => {
						new Notice(Location[value as keyof typeof Location]);
						this.plugin.settings.customActions[index].loc =
							Location[value as keyof typeof Location];
						await this.plugin.saveSettings();
					});
			});
		this.createButton(
			containerEl,
			`Action ${index}: Delete`,
			"Delete",
			async () => {
				const actionToDelete =
					this.plugin.settings.customActions.at(index);
				if (actionToDelete != undefined) {
					this.plugin.settings.customActions.remove(actionToDelete);
					await this.plugin.saveSettings();
				}
				this.display();
			}
		);
	}

	async createAction() {
		let newAction = { ...DEFAULT_ACTION };
		const rand = Math.floor(Math.random() * 999 + 1);
		newAction.name = newAction.name.replace("{{index}}", rand.toString());
		this.plugin.settings.customActions.push(newAction);
		await this.plugin.saveSettings();
	}
}
