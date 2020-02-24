import { IEntity } from "../model/entity.model";
import { AnyAction } from "redux";

export enum EntitiesAction {
    SetCollection = "EntitiesAction.SetCollection",
    SetPlayer = "EntitiesAction.SetPlayer",
    Clear = "EntitiesAction.Clear",
}

export function createSetEntitiesCollectionAction(entities: IEntity[]): AnyAction {
    return { type: EntitiesAction.SetCollection, payload: entities };
}

export function createSetPlayerAction(player: IEntity): AnyAction {
    return { type: EntitiesAction.SetPlayer, payload: player };
}

export function createClearEntitiesAction(): AnyAction {
    return { type: EntitiesAction.Clear };
}
