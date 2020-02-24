import { IEntity } from "../model/entity.model";
import { AnyAction } from "redux";

export enum EntitiesAction {
    SetCollection = "EntitiesAction.SetCollection",
    Clear = "EntitiesAction.Clear",
}

export function createSetEntitiesCollectionAction(entities: IEntity[]): AnyAction {
    return { type: EntitiesAction.SetCollection, payload: entities };
}

export function createClearEntitiesAction(): AnyAction {
    return { type: EntitiesAction.Clear };
}
