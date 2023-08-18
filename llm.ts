import { Configuration, OpenAIApi } from "openai";
import { is_test_mode } from "config";

export async function textCompletion(
	prompt: string,
	input: string,
	apiKey: string
) {
	if (is_test_mode()) {
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
	return response.data.choices[0].message.content.trim();
}
