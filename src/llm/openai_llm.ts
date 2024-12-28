import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";

export enum OpenAIModel {
	// GPT-3.5 Models
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_3_5_TURBO_0125 = "gpt-3.5-turbo-0125",  // Latest stable
	GPT_3_5_TURBO_16K = "gpt-3.5-turbo-16k",
	GPT_3_5_TURBO_INSTRUCT = "gpt-3.5-turbo-instruct",
	
	// GPT-4 Models
	GPT_4 = "gpt-4",
	GPT_4_32K = "gpt-4-32k",
	GPT_4_TURBO = "gpt-4-turbo-preview",  // Latest GPT-4
	GPT_4_VISION = "gpt-4-vision-preview",  // Vision model
	
	// Preview Models
	GPT_4_0125_PREVIEW = "gpt-4-0125-preview",  // Latest preview
	GPT_3_5_TURBO_0125_PREVIEW = "gpt-3.5-turbo-0125-preview",  // Latest 3.5 preview

	// Mini Models (Smaller & Cost-effective)
	GPT_3_5_TURBO_0613 = "gpt-3.5-turbo-0613",  // Legacy stable, good for simple tasks
	GPT_3_5_TURBO_1106 = "gpt-3.5-turbo-1106",  // Previous version, balanced performance
	GPT_3_5_TURBO_INSTRUCT_0914 = "gpt-3.5-turbo-instruct-0914",  // Efficient instruction-following
	GPT_3_5_TURBO_0301 = "gpt-3.5-turbo-0301"  // Most lightweight version
}

export class OpenAILLM extends LLM {
	llm: OpenAI;

	constructor(
		apiKey: string,
		modelName: OpenAIModel = OpenAIModel.GPT_3_5_TURBO_0613,
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
