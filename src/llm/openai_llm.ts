import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";

const queryTimeout = 15000;

export enum OpenAIModel {
	GPT_3_5 = "gpt-3.5-turbo",
	GPT_3_5_16k = "gpt-3.5-turbo-16k",
	GPT_3_5_INSTRUCT = "gpt-3.5-turbo-instruct",
	GPT_4 = "gpt-4",
	GPT_4_32K = "gpt-4-32k",
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
