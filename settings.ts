import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import AIEditor from 'main';
import { UserAction, Selection, Location } from 'action';


const DEFAULT_ACTION: UserAction = {
    name: 'Action {{index}}',
    prompt: 'Enter your prompt',
    sel: Selection.ALL,
    loc: Location.HEAD,
    format: "{{result}}\n",
    modalTitle: "Check result"
}

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

    newAction(containerEl: HTMLElement, action: UserAction, index: number): void {
        new Setting(containerEl)
            .setName(`Action ${index}: Name`)
            .addTextArea(text => {
                text.setValue(action.name)
                    .onChange(async (value) => {
                        this.plugin.settings.customActions[index].name = value;
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Prompt`)
            .addTextArea(text => {
                text.setValue(action.prompt)
                    .onChange(async (value) => {
                        this.plugin.settings.customActions[index].prompt = value;
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Format`)
            .addTextArea(text => {
                text.setValue(action.format)
                    .onChange(async (value) => {
                        this.plugin.settings.customActions[index].format = value;
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Modal title`)
            .addTextArea(text => {
                text.setValue(action.modalTitle)
                    .onChange(async (value) => {
                        this.plugin.settings.customActions[index].modalTitle = value;
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Input selection`)
            .addDropdown(dropdown => {
                dropdown.addOptions({
                    // 'DEFAULT': 'default',
                    'ALL': Selection.ALL.toString()
                })
                    .setValue(action.sel.toString())
                    .onChange(async (value) => {
                        new Notice(value);
                        new Notice(Selection[value as keyof typeof Selection])
                        this.plugin.settings.customActions[index].sel = Selection[value as keyof typeof Selection]
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Output location`)
            .addDropdown(dropdown => {
                dropdown.addOptions({
                    // 'DEFAULT': 'default',
                    'HEAD': Location.HEAD.toString()
                })
                    .setValue(action.loc.toString())
                    .onChange(async (value) => {
                        new Notice(value);
                        new Notice(Location[value as keyof typeof Location])
                        this.plugin.settings.customActions[index].loc = Location[value as keyof typeof Location]
                        await this.plugin.saveSettings();
                    })
            })
        new Setting(containerEl)
            .setName(`Action ${index}: Delete`)
            .addButton((button) => {
                button
                    .setButtonText('Delete')
                    .onClick(async () => {
                        const actionToDelete = this.plugin.settings.customActions.at(index);
                        if (actionToDelete != undefined) {
                            this.plugin.settings.customActions.remove(actionToDelete);
                            await this.plugin.saveSettings();
                        }
                        this.display()
                    })
            })
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('OpenAI API Key')
            .setDesc('OpenAI API Key')
            .addText(text => text
                .setPlaceholder('Enter your API key')
                .setValue(this.plugin.settings.openAiApiKey)
                .onChange(async (value) => {
                    this.plugin.settings.openAiApiKey = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName('Create custom action')
            .addButton(button => button
                .onClick(async () => {
                    let newAction = { ...DEFAULT_ACTION };
                    const rand = Math.floor(Math.random() * (999) + 1);
                    newAction.name = newAction.name.replace("{{index}}", rand.toString());
                    this.plugin.settings.customActions.push(newAction);
                    await this.plugin.saveSettings();
                    this.display();
                }))

        this.plugin.settings.customActions.forEach((action, index) => {
            this.newAction(containerEl, action, index)
        })
    }
}
