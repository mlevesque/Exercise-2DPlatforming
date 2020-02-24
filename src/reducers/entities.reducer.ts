import { IEntity } from "../model/entity.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { EntitiesAction } from "../actions/entities.actions";

export function entitiesReducer(state: IEntity[] = InitState.entities, action: AnyAction): IEntity[] {
    let newState: IEntity[];
    switch (action.type) {
        case EntitiesAction.Set:
            return state.map((entity: IEntity) => {
                return Object.assign({}, entity);
            });
        case EntitiesAction.Clear:
            return [];
    }
    return state;
}
