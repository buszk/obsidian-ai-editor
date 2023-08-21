import { Configuration, OpenAIApi } from "openai";

export async function textCompletion(
	prompt: string,
	input: string,
	apiKey: string,
	testingMode: boolean = false
): Promise<string | undefined> {
	if (testingMode) {
		return "Some text for testing";
	}
	const configuration = new Configuration({
		apiKey: apiKey,
	});
	const openai = new OpenAIApi(configuration);
	const response = await openai.createChatCompletion(
		{
			model: "gpt-3.5-turbo",
			temperature: 0.7,
			max_tokens: 300,
			frequency_penalty: 0,
			presence_penalty: 0,
			top_p: 1.0,
			messages: [
				{ role: "system", content: prompt },
				{ role: "user", content: input },
			],
		},
		{ timeout: 10000 }
	);
	// Safely get response.data.choices[0].message.content.trim() considering undefined
	return response.data.choices?.[0]?.message?.content?.trim();
}
