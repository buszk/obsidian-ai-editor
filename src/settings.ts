import { App, PluginSettingTab, Setting } from "obsidian";
import {
  Location,
  Selection,
  UserAction,
  modelDictionary,
} from "src/action";
import AIEditor from "src/main";
import { Model } from "./llm/models";
import { OpenAIModel } from "./llm/openai_llm";
import { ActionEditModal } from "./modals/action_editor";
import { LLMProvider, ProviderSettings, getModelsForProvider } from "./llm/providers";

export interface AIEditorSettings {
  openAiApiKey: string;
  testingMode: boolean;
  defaultModel: Model;
  customActions: Array<UserAction>;
  providerSettings: ProviderSettings;
}

export const DEFAULT_SETTINGS: AIEditorSettings = {
  openAiApiKey: "",
  testingMode: false,
  defaultModel: OpenAIModel.GPT_3_5_TURBO,
  customActions: [],
  providerSettings: {
    provider: LLMProvider.OPENAI,
    apiKey: "",
  },
};

export class AIEditorSettingTab extends PluginSettingTab {
  plugin: AIEditor;

  constructor(app: App, plugin: AIEditor) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h1", { text: "AI Provider Settings" });

    new Setting(containerEl)
      .setName("AI Provider")
      .setDesc("Choose your preferred AI provider")
      .addDropdown((dropdown) => {
        Object.values(LLMProvider).forEach((provider) => {
          dropdown.addOption(provider, provider.charAt(0).toUpperCase() + provider.slice(1));
        });
        dropdown
          .setValue(this.plugin.settings.providerSettings.provider)
          .onChange(async (value: LLMProvider) => {
            this.plugin.settings.providerSettings.provider = value;
            await this.plugin.saveSettings();
            // Force refresh to show/hide relevant settings
            this.display();
          });
      });

    // Provider-specific settings
    switch (this.plugin.settings.providerSettings.provider) {
      case LLMProvider.OPENAI:
        new Setting(containerEl)
          .setName("OpenAI API Key")
          .setDesc("Your OpenAI API key")
          .addText((text) =>
            text
              .setPlaceholder("Enter your API key")
              .setValue(this.plugin.settings.providerSettings.apiKey)
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.apiKey = value;
                await this.plugin.saveSettings();
              })
          );
        break;

      case LLMProvider.ANTHROPIC:
        new Setting(containerEl)
          .setName("Anthropic API Key")
          .setDesc("Your Anthropic API key")
          .addText((text) =>
            text
              .setPlaceholder("Enter your API key")
              .setValue(this.plugin.settings.providerSettings.apiKey)
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.apiKey = value;
                await this.plugin.saveSettings();
              })
          );
        break;

      case LLMProvider.GOOGLE:
        new Setting(containerEl)
          .setName("Google API Key")
          .setDesc("Your Google AI API key")
          .addText((text) =>
            text
              .setPlaceholder("Enter your API key")
              .setValue(this.plugin.settings.providerSettings.apiKey)
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.apiKey = value;
                await this.plugin.saveSettings();
              })
          );
        new Setting(containerEl)
          .setName("Project ID")
          .setDesc("Your Google Cloud Project ID")
          .addText((text) =>
            text
              .setPlaceholder("Enter your project ID")
              .setValue(this.plugin.settings.providerSettings.projectId || "")
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.projectId = value;
                await this.plugin.saveSettings();
              })
          );
        break;

      case LLMProvider.AZURE_OPENAI:
        new Setting(containerEl)
          .setName("Azure OpenAI API Key")
          .setDesc("Your Azure OpenAI API key")
          .addText((text) =>
            text
              .setPlaceholder("Enter your API key")
              .setValue(this.plugin.settings.providerSettings.apiKey)
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.apiKey = value;
                await this.plugin.saveSettings();
              })
          );
        new Setting(containerEl)
          .setName("Azure OpenAI Endpoint")
          .setDesc("Your Azure OpenAI endpoint URL")
          .addText((text) =>
            text
              .setPlaceholder("https://your-resource.openai.azure.com")
              .setValue(this.plugin.settings.providerSettings.baseUrl || "")
              .onChange(async (value) => {
                this.plugin.settings.providerSettings.baseUrl = value;
                await this.plugin.saveSettings();
              })
          );
        break;
    }

    containerEl.createEl("h1", { text: "General Settings" });

    new Setting(containerEl)
      .setName("Default LLM model")
      .setDesc("Choose the default model for new actions")
      .addDropdown((dropdown) => {
        const models = getModelsForProvider(this.plugin.settings.providerSettings.provider);
        Object.entries(models).forEach(([id, name]) => {
          dropdown.addOption(id, name);
        });
        dropdown
          .setValue(this.plugin.settings.defaultModel.toString())
          .onChange(async (value) => {
            this.plugin.settings.defaultModel = value as Model;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Testing mode")
      .setDesc("Use testing mode to test custom action without calling the AI API")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.testingMode)
          .onChange(async (value) => {
            this.plugin.settings.testingMode = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h1", { text: "Custom actions" });

    this.createButton(
      containerEl,
      "Create custom action",
      "New",
      () => {
        this.displayActionEditModalForNewAction();
      },
      true
    );

    for (let i = 0; i < this.plugin.settings.customActions.length; i++) {
      this.displayActionByIndex(containerEl, i);
    }
  }

  displayActionByIndex(containerEl: HTMLElement, index: number): void {
    const userAction = this.plugin.settings.customActions.at(index);
    if (userAction != undefined) {
      this.createButton(containerEl, userAction.name, "Edit", () => {
        this.displayActionEditModalByActionAndIndex(userAction, index);
      });
    }
  }

  createButton(
    containerEl: HTMLElement,
    name: string,
    buttonText: string,
    onClickHandler: () => void,
    cta = false
  ): void {
    new Setting(containerEl).setName(name).addButton((button) => {
      button.setButtonText(buttonText).onClick(onClickHandler);
      if (cta) {
        button.setCta();
      }
    });
  }

  private displayActionEditModalForNewAction() {
    const DUMMY_ACTION: UserAction = {
      name: "Action Name",
      prompt: "Enter your prompt",
      sel: Selection.ALL,
      loc: Location.INSERT_HEAD,
      format: "{{result}}\n",
      modalTitle: "Check result",
      model: this.plugin.settings.defaultModel,
    };
    new ActionEditModal(
      this.app,
      this.plugin,
      DUMMY_ACTION,
      async (action: UserAction) => {
        this.plugin.settings.customActions.push(action);
        await this.saveSettingsAndRefresh();
      },
      undefined
    ).open();
  }

  private displayActionEditModalByActionAndIndex(
    userAction: UserAction,
    index: number
  ) {
    new ActionEditModal(
      this.app,
      this.plugin,
      userAction,
      async (action: UserAction) => {
        await this.saveUserActionAndRefresh(index, action);
      },
      async () => {
        await this.deleteUserActionAndRefresh(index);
      }
    ).open();
  }

  private async deleteUserActionAndRefresh(index: number) {
    const actionToDelete = this.plugin.settings.customActions.at(index);
    if (actionToDelete != undefined) {
      this.plugin.settings.customActions.remove(actionToDelete);
      await this.saveSettingsAndRefresh();
    }
  }

  private async saveUserActionAndRefresh(index: number, action: UserAction) {
    this.plugin.settings.customActions[index] = action;
    await this.saveSettingsAndRefresh();
  }

  private async saveSettingsAndRefresh() {
    await this.plugin.saveSettings();
    this.plugin.registerActions();
    this.display();
  }
}
