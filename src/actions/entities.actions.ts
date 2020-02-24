import { IEntity } from "../model/entity.model";
import { AnyAction } from "redux";

export enum EntitiesAction {
    Set = "EntitiesAction.Set",
    Clear = "EntitiesAction.Clear",
}

export function createSetEntitiesAction(entities: IEntity[]): AnyAction {
    return { type: EntitiesAction.Set, payload: entities };
}

export function createClearEntitiesAction(): AnyAction {
    return { type: EntitiesAction.Clear };
}
