import { LLM } from "./base";
import OpenAI from "openai";

export class AzureOpenAILLM extends LLM {
    private client: OpenAI;
    private model: string;
    private temperature: number;

    constructor(
        apiKey: string,
        baseUrl: string,
        model: string = "gpt-35-turbo",
        temperature: number = 0.7
    ) {
        super();
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl,
            defaultQuery: { "api-version": "2024-02-15-preview" },
            defaultHeaders: { "api-key": apiKey }
        });
        this.model = model;
        this.temperature = temperature;
    }

    async autocomplete(text: string): Promise<string> {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: text }],
            temperature: this.temperature,
        });
        return completion.choices[0].message.content || "";
    }

    async autocompleteStreamingInner(
        text: string,
        callback: (text: string) => void
    ): Promise<void> {
        const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: text }],
            temperature: this.temperature,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                callback(content);
            }
        }
    }
}
