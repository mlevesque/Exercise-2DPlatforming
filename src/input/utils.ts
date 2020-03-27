import { InputType, IInputActions } from "../redux/state";

/**
 * Returns if a given input key is currently down.
 * @param inputType 
 * @param inputActions 
 */
export function isKeyDown(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && action.current;
}

/**
 * Returns if a given input key is currently up
 * @param inputType 
 * @param inputActions 
 */
export function isKeyUp(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && !action.current;
}

/**
 * Returns if a given key has just been pressed, but wasn't in the last update.
 * @param inputType 
 * @param inputActions 
 */
export function isKeyPressed(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && action.current && !action.previous;
}

/**
 * Returns if a given key has just been released, but was down in the last update.
 * @param inputType 
 * @param inputActions 
 */
export function isKeyReleased(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && !action.current && action.previous;
}
