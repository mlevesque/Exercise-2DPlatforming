import { IMap } from "../model/map.model";
import { AnyAction } from "redux";

export enum MapAction {
    Set = "MapAction.Set",
    Clear = "MapAction.Clear",
}

export function createSetMapAction(map: IMap): AnyAction {
    return { type: MapAction.Set, payload: map };
}

export function createClearMapAction(): AnyAction {
    return { type: MapAction.Clear };
}
