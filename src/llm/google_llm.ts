import { LLM } from "./base";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_MODELS } from "./providers";

export class GoogleLLM extends LLM {
    private client: GoogleGenerativeAI;
    private model: string;
    private temperature: number;

    constructor(
        apiKey: string,
        model: string = GOOGLE_MODELS.GEMINI_PRO,
        temperature: number = 0.7
    ) {
        super();
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = model;
        this.temperature = temperature;
    }

    async autocomplete(text: string): Promise<string> {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent(text);
        const response = await result.response;
        return response.text();
    }

    async autocompleteStreamingInner(
        text: string,
        callback: (text: string) => void
    ): Promise<void> {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContentStream(text);
        
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                callback(chunkText);
            }
        }
    }
}
