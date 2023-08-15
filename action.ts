export enum Selection {
    ALL = 'ALL'
}

export enum Location {
    HEAD = 'HEAD'
}

export interface UserAction {
    name: string,
    prompt: string,
    sel: Selection,
    loc: Location
    format: string,
    modalTitle: string,
}
