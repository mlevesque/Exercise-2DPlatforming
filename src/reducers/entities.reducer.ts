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
