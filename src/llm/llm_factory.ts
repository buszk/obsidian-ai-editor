import { LLM } from "./base";
import { OpenAILLM } from "./openai_llm";
import { AnthropicLLM } from "./anthropic_llm";
import { GoogleLLM } from "./google_llm";
import { MistralLLM } from "./mistral_llm";
import { AzureOpenAILLM } from "./azure_llm";
import { LLMProvider, ProviderSettings } from "./providers";

export class LLMFactory {
    static createLLM(settings: ProviderSettings, model: string, temperature: number = 0.7): LLM {
        switch (settings.provider) {
            case LLMProvider.OPENAI:
                return new OpenAILLM(settings.apiKey, model as any, temperature);
            
            case LLMProvider.ANTHROPIC:
                return new AnthropicLLM(settings.apiKey, model, temperature);
            
            case LLMProvider.GOOGLE:
                return new GoogleLLM(settings.apiKey, model, temperature);
            
            case LLMProvider.MISTRAL:
                return new MistralLLM(settings.apiKey, model, temperature);
            
            case LLMProvider.AZURE_OPENAI:
                if (!settings.baseUrl) {
                    throw new Error("Azure OpenAI requires a base URL");
                }
                return new AzureOpenAILLM(settings.apiKey, settings.baseUrl, model, temperature);
            
            default:
                throw new Error(`Unsupported LLM provider: ${settings.provider}`);
        }
    }
}
