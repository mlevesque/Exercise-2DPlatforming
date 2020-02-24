import { AnyAction, Store } from "redux";
import { createSetInputAction } from "../actions/input.actions";
import { InputType } from "../model/input.model";

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
