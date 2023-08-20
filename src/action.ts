export enum Selection {
	ALL = "ALL",
	CURSOR = "CURSOR",
}

export enum Location {
	INSERT_HEAD = "INSERT_HEAD",
	APPEND_BOTTOM = "APPEND_BOTTOM",
	APPEND_CURRENT = "APPEND_CURRENT",
	REPLACE_CURRENT = "REPLACE_CURRENT",
}

export interface UserAction {
	name: string;
	prompt: string;
	sel: Selection;
	loc: Location;
	format: string;
	modalTitle: string;
}

const SELECTION_SETTING: { [key: string]: string } = {
	[Selection.ALL.toString()]: "Select the whole document",
	[Selection.CURSOR.toString()]: "Input selected text by cursor",
};

const LOCATION_SETTING: { [key: string]: string } = {
	[Location.INSERT_HEAD.toString()]:
		"Insert at the beginning of the document",
	[Location.APPEND_BOTTOM.toString()]: "Append to the end of the document",
	[Location.APPEND_CURRENT.toString()]: "Append to the end of current selection",
	[Location.REPLACE_CURRENT.toString()]: "Replace the current selection",
};

export function locationDictionary(): { [key: string]: string } {
	return Object.keys(Location).reduce((obj, key) => {
        console.log(key);
		obj[key] = LOCATION_SETTING[key];
		return obj;
	}, {} as { [key: string]: string });
}

export function selectionDictionary(): { [key: string]: string } {
	return Object.keys(Selection).reduce((obj, key) => {
		obj[key] = SELECTION_SETTING[key];
		return obj;
	}, {} as { [key: string]: string });
}
