import { LLM } from "./base";
import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODELS } from "./providers";

export class AnthropicLLM extends LLM {
    private client: Anthropic;
    private model: string;
    private temperature: number;

    constructor(
        apiKey: string,
        model: string = ANTHROPIC_MODELS.CLAUDE_3_SONNET,
        temperature: number = 0.7
    ) {
        super();
        this.client = new Anthropic({
            apiKey: apiKey
        });
        this.model = model;
        this.temperature = temperature;
    }

    async autocomplete(text: string): Promise<string> {
        const message = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            temperature: this.temperature,
            messages: [{ role: "user", content: text }]
        });
        return message.content[0].text;
    }

    async autocompleteStreamingInner(
        text: string,
        callback: (text: string) => void
    ): Promise<void> {
        const stream = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            temperature: this.temperature,
            messages: [{ role: "user", content: text }],
            stream: true
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta') {
                callback(chunk.delta.text);
            }
        }
    }
}
