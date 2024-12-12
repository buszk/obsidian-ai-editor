import { OpenAIModel } from "./openai_llm";

export type Model = OpenAIModel | {};

export const DEFAULT_MODEL: Model = OpenAIModel.GPT_4O_MINI;
