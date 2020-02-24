import { IEntity, copyEntity } from "../model/entity.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { EntitiesAction } from "../actions/entities.actions";

export function entitiesReducer(state: IEntity[] = InitState.entities, action: AnyAction): IEntity[] {
    switch (action.type) {
        case EntitiesAction.SetCollection:
            return action.payload.map((entity: IEntity) => {
                return copyEntity(entity);
            });
        case EntitiesAction.Clear:
            return [];
    }
    return state;
}

export function playerReducer(state: string = InitState.playerId, action: AnyAction): string {
    switch (action.type) {
        case EntitiesAction.SetPlayerId:
            return action.payload;
        case EntitiesAction.Clear:
            return null;
    }
    return state;
}
