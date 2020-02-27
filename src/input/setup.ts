import { Store, AnyAction } from "redux";
import { actionSetInput } from "../redux/actionCreators";
import { InputType } from "../redux/state";

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
                store.dispatch(actionSetInput(InputType.Jump, keyState));
                e.preventDefault();
                break;
            case "ArrowLeft":
                store.dispatch(actionSetInput(InputType.Left, keyState));
                e.preventDefault();
                break;
            case "ArrowRight":
                store.dispatch(actionSetInput(InputType.Right, keyState));
                e.preventDefault();
                break;
            case "Escape":
                store.dispatch(actionSetInput(InputType.Reset, keyState));
                break;
        }
    });
}
