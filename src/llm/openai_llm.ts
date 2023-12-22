import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";

export enum OpenAIModel {
	GPT_3_5 = "gpt-3.5-turbo",
	GPT_3_5_16k = "gpt-3.5-turbo-16k",
	GPT_3_5_INSTRUCT = "gpt-3.5-turbo-instruct",
	GPT_3_5_TURBO_PREVIEW = "gpt-3.5-turbo-1106",
	GPT_4 = "gpt-4",
	GPT_4_32K = "gpt-4-32k",
	GPT_4_TURBO_PREVIEW = "gpt-4-1106-preview",
}

export class OpenAILLM extends LLM {
	llm: OpenAI;

	constructor(
		apiKey: string,
		modelName: OpenAIModel = OpenAIModel.GPT_3_5_TURBO_PREVIEW,
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
