export enum Selection {
    ALL
}

export enum Location {
    HEAD
}

export interface UserAction {
    name: string,
    prompt: string,
    sel: Selection,
    loc: Location
    format: string,
    modalTitle: string,
}
