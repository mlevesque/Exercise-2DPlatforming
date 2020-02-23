import { AnyAction, Store } from "redux";
import { createSetInputAction } from "../actions/input.actions";
import { InputType } from "../model/input.model";

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
