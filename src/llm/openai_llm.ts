import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";

export enum OpenAIModel {
	// GPT-3.5 Models
	GPT_3_5_TURBO = "gpt-3.5-turbo",  
	GPT_3_5_TURBO_0125 = "gpt-3.5-turbo-0125", 
	
	// GPT-4 Models
	GPT_4 = "gpt-4",  // Base GPT-4
	GPT_4_TURBO = "gpt-4-turbo-preview",  // Latest GPT-4
	GPT_4_1106_PREVIEW = "gpt-4-1106-preview",  // Cost-effective GPT-4
}

export class OpenAILLM extends LLM {
	llm: OpenAI;

	constructor(
		apiKey: string,
		modelName: OpenAIModel = OpenAIModel.GPT_3_5_TURBO,
		temperature: number = 0.7
	) {
		super();
		this.llm = new OpenAI({
			modelName: modelName.toString(),
			openAIApiKey: apiKey,
			temperature: temperature,
			streaming: true,
			cache: true,
		});
	}

	async autocomplete(text: string): Promise<string> {
		let response = await this.llm.call(text, {
			timeout: this.queryTimeout,
		});
		return response.trim();
	}

	async autocompleteStreamingInner(
		text: string,
		callback: (text: string) => void
	): Promise<void> {
		await this.llm.call(text, {
			callbacks: [{ handleLLMNewToken: callback }],
		});
	}
}
