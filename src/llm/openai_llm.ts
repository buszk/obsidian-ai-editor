import { OpenAI } from "langchain/llms/openai";
import { LLM } from "./base";
import { Notice } from "obsidian";

const queryTimeout = 0;

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
			timeout: queryTimeout,
		});
		return response.trim();
	}

	async autocompleteStreaming(
		text: string,
		callback: (text: string) => void
	): Promise<void> {
		let start_time = new Date().getTime();
		var last_tick = new Date().getTime();
		var has_timeout = false;

		// define a wrapper function to handle timeout
		function callback_wrapper(text: string): void {
			// Once start the query promise, we cannot cancel it.
			// Ignore the callback if timeout has already happened.
			if (has_timeout) {
				return;
			}
			last_tick = new Date().getTime();
			callback(text);
		}

		let promise = this.llm.call(text, {
			callbacks: [{ handleLLMNewToken: callback_wrapper }],
		});

		return new Promise<void>((resolve, reject) => {
			const intervalId = setInterval(() => {
				let now = new Date().getTime();
				new Notice("now: " + (now - start_time )+ " last_tick: " + (last_tick - start_time))
				if (now - last_tick > queryTimeout) {
					has_timeout = true;
					clearInterval(intervalId);
					reject("Timeout: last streaming output is " + (now - last_tick) + "ms ago.");
				}
			}, 1000);
			promise
				.then((_) => {
					clearInterval(intervalId);
					resolve();
				})
				.catch((error) => {
					clearInterval(intervalId);
					reject(error);
				});
		});
	}
}
