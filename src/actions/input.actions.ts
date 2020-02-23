import { InputType } from "../model/input.model";
import { AnyAction } from "redux";

export enum InputAction {
    Set = 'INPUT_SET',
    Update = 'INPUT_UPDATE',
}

export function createSetInputAction(type: InputType, state: boolean): AnyAction {
    return { type: InputAction.Set, payload: {type: type, state: state} };
}

export function createUpdateInputAction(): AnyAction {
    return { type: InputAction.Update };
}
