export enum InputType {
    Left = "Left",
    Right = "Right",
    Jump = "Jump",
}

interface IInputSet {
    previous: boolean;
    current: boolean;
}

export interface IInputActions {
    [inputType: string]: IInputSet;
}
