import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";

const queryTimeout = 15000;

export enum OpenAIModel {
	GPT_3_5 = "gpt-3.5-turbo",
}

export class OpenAILLM extends LLM {
	llm: OpenAI;

	constructor(
		apiKey: string,
		modelName: OpenAIModel = OpenAIModel.GPT_3_5,
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
			timeout: queryTimeout,
		});
		return response.trim();
	}

	async autocompleteStreaming(
		text: string,
		callback: (text: string) => void
	): Promise<void> {
		await this.llm.call(text, {
			timeout: queryTimeout,
			callbacks: [{ handleLLMNewToken: callback }],
		});
	}
}
