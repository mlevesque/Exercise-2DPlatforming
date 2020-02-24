export enum InputType {
    Left = "Left",
    Right = "Right",
    Jump = "Jump",
    Reset = "Reset",
}

interface IInputSet {
    previous: boolean;
    current: boolean;
}

export interface IInputActions {
    [inputType: string]: IInputSet;
}
