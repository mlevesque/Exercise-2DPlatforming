import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { LoadingAction } from "../actions/loading.action";

export function loadingReducer(state: boolean = InitState.loading, action: AnyAction): boolean {
    switch(action.type) {
        case LoadingAction.SetFlag:
            return action.payload;
    }
    return state;
}
