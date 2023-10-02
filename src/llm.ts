import { OpenAI } from "langchain/llms/openai";

const textForTesting =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const queryTimeout = 15000;

export async function textCompletion(
	prompt: string,
	input: string,
	apiKey: string,
	testingMode: boolean = false
): Promise<string | undefined> {
	if (testingMode) {
		return textForTesting;
	}
	const llm = new OpenAI({
		modelName: "gpt-3.5-turbo",
		openAIApiKey: apiKey,
		temperature: 0.7,
		cache: true,
	});
	const response = await llm.call(prompt + "\n" + input, {
		timeout: queryTimeout,
	});
	return response.trim();
}

export async function textCompletionStreaming(
	prompt: string,
	input: string,
	apiKey: string,
	callback: (token: string) => void,
	testingMode: boolean = false
): Promise<undefined> {
	if (testingMode) {
		const split = textForTesting.split(" ");
		for (const element of split) {
			callback(element + " ");
			await new Promise((r) => setTimeout(r, 20));
		}
		return;
	}
	const llm = new OpenAI({
		modelName: "gpt-3.5-turbo",
		openAIApiKey: apiKey,
		temperature: 0.7,
		cache: true,
		streaming: true,
	});
	const response = await llm.call(prompt + "\n" + input, {
		timeout: 15000,
		callbacks: [{ handleLLMNewToken: callback }],
	});
}
