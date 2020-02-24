import { IEntity } from "../model/entity.model";
import { AnyAction } from "redux";

export enum EntitiesAction {
    SetCollection = "EntitiesAction.SetCollection",
    SetPlayerId = "EntitiesAction.SetPlayerId",
    Clear = "EntitiesAction.Clear",
}

export function createSetEntitiesCollectionAction(entities: IEntity[]): AnyAction {
    return { type: EntitiesAction.SetCollection, payload: entities };
}

export function createSetPlayerIdAction(playerId: string): AnyAction {
    return { type: EntitiesAction.SetPlayerId, payload: playerId };
}

export function createClearEntitiesAction(): AnyAction {
    return { type: EntitiesAction.Clear };
}
