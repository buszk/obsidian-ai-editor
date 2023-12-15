import { UserAction } from "src/action";
import { AIEditorSettings } from "src/settings";
import { LLM } from "./base";
import { DummyLLM } from "./dummy_llm";
import { OpenAILLM, OpenAIModel } from "./openai_llm";
import { Notice } from "obsidian";

export class LLMFactory {
	settings: AIEditorSettings;
	constructor(settings: AIEditorSettings) {
		this.settings = settings;
	}

	createLLM(userAction: UserAction): LLM {
		if (this.settings.testingMode) {
			return new DummyLLM();
		}

		if (userAction.model == undefined) {
            new Notice("Model not set, using default");
			userAction.model = OpenAIModel.GPT_3_5_TURBO_PREVIEW;
		}

        if (Object.values(OpenAIModel).includes(userAction.model as any)) {
			if (!this.settings.openAiApiKey) {
				throw "API key is not set in plugin settings";
			}
			return new OpenAILLM(
				this.settings.openAiApiKey,
				userAction.model as OpenAIModel
			);
		}

		throw `Model ${userAction.model.toString()} not found`;
	}
}
