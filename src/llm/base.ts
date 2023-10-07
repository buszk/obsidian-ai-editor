export abstract class LLM {
	abstract autocomplete(text: string): Promise<string>;

	abstract autocompleteStreaming(
		text: string,
		callback: (text: string) => void

	): Promise<void>;
}
