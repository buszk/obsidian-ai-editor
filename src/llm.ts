import { OpenAI } from "langchain/llms/openai";

export async function textCompletion(
	prompt: string,
	input: string,
	apiKey: string,
	testingMode: boolean = false
): Promise<string | undefined> {
	if (testingMode) {
		return "Some text for testing";
	}
	const llm = new OpenAI({
		modelName: "gpt-3.5-turbo",
		openAIApiKey: apiKey,
		temperature: 0.7,
	});
	const response = await llm.call(prompt + "\n" + input, { timeout: 15000 });
	return response.trim();
}
