import { AnyAction, Store } from "redux";
import { createSetInputAction } from "../actions/input.actions";
import { InputType, IInputActions } from "../model/input.model";
import { IEntity, EntityAnimation } from "../model/entity.model";
import { changeAnimationOnEntity } from "./animation.logic";

/**
 * Returns if a given input key is currently down.
 * @param inputType 
 * @param inputActions 
 */
function isKeyDown(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && action.current;
}

/**
 * Returns if a given input key is currently up
 * @param inputType 
 * @param inputActions 
 */
function isKeyUp(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && !action.current;
}

/**
 * Returns if a given key has just been pressed, but wasn't in the last update.
 * @param inputType 
 * @param inputActions 
 */
function isKeyPressed(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && action.current && !action.previous;
}

/**
 * Returns if a given key has just been released, but was down in the last update.
 * @param inputType 
 * @param inputActions 
 */
function isKeyReleased(inputType: InputType, inputActions: IInputActions): boolean {
    let action = inputActions[inputType];
    return action && !action.current && action.previous;
}

/**
 * Sets up keyboard listener for keyboard input that stores input control state to the redux store.
 * @param store Reference to the redux store. Needed for dispatching actions to update store.
 * @param eventType Should be either "keydown" or "keyup".
 * @param keyState The value to set for the state of a particular control action - true for "keydown", false for "keyup"
 */
export function setupInputListener(store: Store<any, AnyAction>, eventType: string, keyState: boolean): void {
    document.addEventListener(eventType, (e: KeyboardEvent): void => {
        switch(e.code) {
            case "Space":
            case "ArrowUp":
                store.dispatch(createSetInputAction(InputType.Jump, keyState));
                e.preventDefault();
                break;
            case "ArrowLeft":
                store.dispatch(createSetInputAction(InputType.Left, keyState));
                e.preventDefault();
                break;
            case "ArrowRight":
                store.dispatch(createSetInputAction(InputType.Right, keyState));
                e.preventDefault();
                break;
        }
    });
}

/**
 * Generator function for updating player input actions and affecting the player entity.
 * @param deltaT Frame time.
 * @param player Player entity.
 * @param inputActions Recorded input actions from the redux store.
 */
export function* updatePlayerActions(deltaT: number, player: IEntity, inputActions: IInputActions) {
    let goLeft = isKeyDown(InputType.Left, inputActions);
    let goRight = isKeyDown(InputType.Right, inputActions);

    if (goLeft && !goRight) {
        player.flip = true;
        changeAnimationOnEntity(player, EntityAnimation.Walk, false);
    }
    else if (goRight && !goLeft) {
        player.flip = false;
        changeAnimationOnEntity(player, EntityAnimation.Walk, false);
    }
    else {
        changeAnimationOnEntity(player, EntityAnimation.Idle, false);
    }
}
