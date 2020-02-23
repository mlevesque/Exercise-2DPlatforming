import { IMap } from "../model/map.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { MapAction } from "../actions/map.actions";

export function mapReducer(state: IMap = InitState.map, action: AnyAction): IMap {
    switch (action.type) {
        case MapAction.Set:
            return Object.assign({}, action.payload);
        case MapAction.Clear:
            return null
    }
    return state;
}
