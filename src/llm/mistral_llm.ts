import { LLM } from "./base";
import MistralClient from "@mistralai/mistralai";
import { MISTRAL_MODELS } from "./providers";

export class MistralLLM extends LLM {
    private client: MistralClient;
    private model: string;
    private temperature: number;

    constructor(
        apiKey: string,
        model: string = MISTRAL_MODELS.MISTRAL_MEDIUM,
        temperature: number = 0.7
    ) {
        super();
        this.client = new MistralClient(apiKey);
        this.model = model;
        this.temperature = temperature;
    }

    async autocomplete(text: string): Promise<string> {
        const chatResponse = await this.client.chat({
            model: this.model,
            messages: [{ role: "user", content: text }],
            temperature: this.temperature,
        });
        return chatResponse.choices[0].message.content;
    }

    async autocompleteStreamingInner(
        text: string,
        callback: (text: string) => void
    ): Promise<void> {
        const stream = await this.client.chatStream({
            model: this.model,
            messages: [{ role: "user", content: text }],
            temperature: this.temperature,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                callback(content);
            }
        }
    }
}
