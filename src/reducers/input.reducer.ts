import { IInputActions } from "../model/input.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { InputAction } from "../actions/input.actions";

export function inputReducer(state: IInputActions = InitState.input, action: AnyAction): IInputActions {
    let newState: IInputActions;
    switch(action.type) {
        ///////////////////////////////////////////////////////////////////////////////////////////
        // SET INPUT
        case InputAction.Set:
            newState = Object.assign({}, state);
            newState[action.payload.type].current = action.payload.state;
            return newState;


        ///////////////////////////////////////////////////////////////////////////////////////////
        // UPDATE INPUT
        case InputAction.Update:
            newState = Object.assign({}, state);
            for (const key in newState) {
                newState[key].previous = newState[key].current;
            }
            return newState;
    }
    return state;
}
