export enum Selection {
	ALL = "ALL",
}

export enum Location {
	HEAD = "HEAD",
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
	[Selection.ALL]: "Text the whole document",
};

const LOCATION_SETTING: { [key: string]: string } = {
	[Location.HEAD]: "Add at the head of document",
};

export function locationDictionary(): { [key: string]: string } {
	return Object.keys(Location).reduce((obj, key) => {
		obj[key] = SELECTION_SETTING[key];
		return obj;
	}, {} as { [key: string]: string });
}

export function selectionDictionary(): { [key: string]: string } {
	return Object.keys(Selection).reduce((obj, key) => {
		obj[key] = LOCATION_SETTING[key];
		return obj;
	}, {} as { [key: string]: string });
}
