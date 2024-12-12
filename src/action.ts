import { Model } from "./llm/models";
import { OpenAIModel } from "./llm/openai_llm";

export enum Selection {
	ALL = "ALL",
	CURSOR = "CURSOR",
}

export enum Location {
	INSERT_HEAD = "INSERT_HEAD",
	APPEND_BOTTOM = "APPEND_BOTTOM",
	APPEND_CURRENT = "APPEND_CURRENT",
	APPEND_TO_FILE = "APPEND_TO_FILE",
	REPLACE_CURRENT = "REPLACE_CURRENT",
}


export interface UserAction {
	name: string;
	prompt: string;
	sel: Selection;
	loc: Location;
	locationExtra?: { fileName: string };
	format: string;
	modalTitle: string;
	model: Model;
}

const SELECTION_SETTING: { [key: string]: string } = {
	[Selection.ALL.toString()]: "Select the whole document",
	[Selection.CURSOR.toString()]: "Input selected text by cursor",
};

const LOCATION_SETTING: { [key: string]: string } = {
	[Location.INSERT_HEAD.toString()]:
		"Insert at the beginning of the document",
	[Location.APPEND_BOTTOM.toString()]: "Append to the end of the document",
	[Location.APPEND_CURRENT.toString()]:
		"Append to the end of current selection",
	[Location.REPLACE_CURRENT.toString()]: "Replace the current selection",
	[Location.APPEND_TO_FILE.toString()]: "Append to a file specified below",
};

const MODEL_NAMES: { [key: string]: string } = {
	[OpenAIModel.GPT_3_5_16k]: "OpenAI GPT-3.5-16k",
	[OpenAIModel.GPT_3_5_INSTRUCT]: "OpenAI GPT-3.5-instruct",
	[OpenAIModel.GPT_3_5_TURBO_PREVIEW]: "OpenAI GPT-3.5-turbo-preview",
	[OpenAIModel.GPT_3_5_TURBO]: "OpenAI GPT-3.5-turbo",
	[OpenAIModel.GPT_4]: "OpenAI GPT-4",
	[OpenAIModel.GPT_4_32K]: "OpenAI GPT-4-32k",
	[OpenAIModel.GPT_4_TURBO_PREVIEW]: "OpenAI GPT-4-turbo-preview",
	[OpenAIModel.GPT_4_TURBO]: "OpenAI GPT-4-turbo",
	[OpenAIModel.GPT_4O]: "OpenAI GPT-4o",
	[OpenAIModel.GPT_4O_AUDIO_PREVIEW]: "OpenAI GPT-4o-audio-preview",
	[OpenAIModel.GPT_4O_AUDIO_PREVIEW_2024_10_01]: "OpenAI GPT-4o-audio-preview-2024-10-01",
	[OpenAIModel.GPT_4O_MINI]: "OpenAI GPT-4o-mini",
	[OpenAIModel.GPT_4O_MINI_2024_07_18]: "OpenAI GPT-4o-mini-2024-07-18",
	[OpenAIModel.O1_MINI]: "OpenAI O1-mini",
	[OpenAIModel.O1_MINI_2024_09_12]: "OpenAI O1-mini-2024-09-12",
	[OpenAIModel.O1_PREVIEW]: "OpenAI O1-preview",
	[OpenAIModel.O1_PREVIEW_2024_09_12]: "OpenAI O1-preview-2024-09-12",
	[OpenAIModel.CHATGPT_4O_LATEST]: "OpenAI ChatGPT-4o-latest",
	[OpenAIModel.GPT_4O_2024_05_13]: "OpenAI GPT-4o-2024-05-13",
	[OpenAIModel.GPT_4O_2024_08_06]: "OpenAI GPT-4o-2024-08-06",
	[OpenAIModel.GPT_4O_2024_11_20]: "OpenAI GPT-4o-2024-11-20",
	[OpenAIModel.GPT_4_TURBO_PREVIEW_2024]: "OpenAI GPT-4-turbo-preview-2024",
	[OpenAIModel.GPT_4_0314]: "OpenAI GPT-4-0314",
	[OpenAIModel.GPT_4_0613]: "OpenAI GPT-4-0613",
	[OpenAIModel.GPT_4_32K_0314]: "OpenAI GPT-4-32k-0314",
	[OpenAIModel.GPT_4_32K_0613]: "OpenAI GPT-4-32k-0613",
	[OpenAIModel.GPT_4_TURBO_2024_04_09]: "OpenAI GPT-4-turbo-2024-04-09",
	[OpenAIModel.GPT_4_0125_PREVIEW]: "OpenAI GPT-4-0125-preview",
	[OpenAIModel.GPT_4_VISION_PREVIEW]: "OpenAI GPT-4-vision-preview",
	[OpenAIModel.GPT_4_1106_VISION_PREVIEW]: "OpenAI GPT-4-1106-vision-preview",
	[OpenAIModel.GPT_3_5_TURBO_0301]: "OpenAI GPT-3.5-turbo-0301",
	[OpenAIModel.GPT_3_5_TURBO_0613]: "OpenAI GPT-3.5-turbo-0613",
	[OpenAIModel.GPT_3_5_TURBO_0125]: "OpenAI GPT-3.5-turbo-0125",
	[OpenAIModel.GPT_3_5_TURBO_16K_0613]: "OpenAI GPT-3.5-turbo-16k-0613",
	[OpenAIModel.FT_GPT_3_5_TURBO]: "OpenAI FT-GPT-3.5-turbo",
	[OpenAIModel.FT_GPT_3_5_TURBO_0125]: "OpenAI FT-GPT-3.5-turbo-0125",
	[OpenAIModel.FT_GPT_3_5_TURBO_1106]: "OpenAI FT-GPT-3.5-turbo-1106",
	[OpenAIModel.FT_GPT_3_5_TURBO_0613]: "OpenAI FT-GPT-3.5-turbo-0613",
	[OpenAIModel.FT_GPT_4_0613]: "OpenAI FT-GPT-4-0613",
	[OpenAIModel.FT_GPT_4O_2024_08_06]: "OpenAI FT-GPT-4o-2024-08-06",
	[OpenAIModel.FT_GPT_4O_2024_11_20]: "OpenAI FT-GPT-4o-2024-11-20",
	[OpenAIModel.FT_GPT_4O_MINI_2024_07_18]: "OpenAI FT-GPT-4o-mini-2024-07-18",
  };

export function locationDictionary(): { [key: string]: string } {
	return Object.values(Location).reduce((obj, value) => {
		obj[value] = LOCATION_SETTING[value];
		return obj;
	}, {} as { [key: string]: string });
}

export function selectionDictionary(): { [key: string]: string } {
	return Object.values(Selection).reduce((obj, value) => {
		obj[value] = SELECTION_SETTING[value];
		return obj;
	}, {} as { [key: string]: string });
}

export function modelDictionary(): { [key: string]: string } {
	return Object.values(OpenAIModel).reduce((obj, value) => {
		obj[value] = MODEL_NAMES[value];
		return obj;
	}, {} as { [key: string]: string });
}
