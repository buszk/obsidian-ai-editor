export enum LLMProvider {
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    GOOGLE = "google",
    MISTRAL = "mistral",
    AZURE_OPENAI = "azure_openai"
}

export interface ProviderSettings {
    provider: LLMProvider;
    apiKey: string;
    // Optional settings for specific providers
    baseUrl?: string;  // For Azure OpenAI
    organizationId?: string;  // For OpenAI org
    projectId?: string;  // For Google AI
}

// Model mappings for each provider
export const ANTHROPIC_MODELS = {
    CLAUDE_3_OPUS: "claude-3-opus-20240229",
    CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
    CLAUDE_2_1: "claude-2.1",
    CLAUDE_INSTANT: "claude-instant-1.2"
} as const;

export const GOOGLE_MODELS = {
    GEMINI_PRO: "gemini-pro",
    GEMINI_PRO_VISION: "gemini-pro-vision"
} as const;

export const MISTRAL_MODELS = {
    MISTRAL_TINY: "mistral-tiny",
    MISTRAL_SMALL: "mistral-small",
    MISTRAL_MEDIUM: "mistral-medium"
} as const;

// Helper function to get available models for a provider
export function getModelsForProvider(provider: LLMProvider): Record<string, string> {
    switch (provider) {
        case LLMProvider.OPENAI:
            return {
                "gpt-3.5-turbo": "GPT-3.5 Turbo",
                "gpt-4": "GPT-4",
                "gpt-4-turbo-preview": "GPT-4 Turbo",
                "gpt-4-1106-preview": "GPT-4 (Cost-effective)"
            };
        case LLMProvider.ANTHROPIC:
            return {
                [ANTHROPIC_MODELS.CLAUDE_3_OPUS]: "Claude 3 Opus",
                [ANTHROPIC_MODELS.CLAUDE_3_SONNET]: "Claude 3 Sonnet",
                [ANTHROPIC_MODELS.CLAUDE_2_1]: "Claude 2.1",
                [ANTHROPIC_MODELS.CLAUDE_INSTANT]: "Claude Instant"
            };
        case LLMProvider.GOOGLE:
            return {
                [GOOGLE_MODELS.GEMINI_PRO]: "Gemini Pro",
                [GOOGLE_MODELS.GEMINI_PRO_VISION]: "Gemini Pro Vision"
            };
        case LLMProvider.MISTRAL:
            return {
                [MISTRAL_MODELS.MISTRAL_TINY]: "Mistral Tiny",
                [MISTRAL_MODELS.MISTRAL_SMALL]: "Mistral Small",
                [MISTRAL_MODELS.MISTRAL_MEDIUM]: "Mistral Medium"
            };
        case LLMProvider.AZURE_OPENAI:
            return {
                "gpt-35-turbo": "GPT-3.5 Turbo",
                "gpt-4": "GPT-4"
            };
        default:
            return {};
    }
}
