import { UserAction } from "src/action";
import { AIEditorSettings } from "src/settings";
import { LLM } from "./base";
import { DummyLLM } from "./dummy_llm";
import { OpenAILLM } from "./openai_llm";

export class LLMFactory {
	settings: AIEditorSettings;
	constructor(settings: AIEditorSettings) {
		this.settings = settings;
	}

	createLLM(userAction: UserAction): LLM {
		if (this.settings.testingMode) {
			return new DummyLLM();
		} else {
			if (!this.settings.openAiApiKey) {
				throw "API key is not set in plugin settings";
			}
			return new OpenAILLM(this.settings.openAiApiKey);
		}
	}
}
