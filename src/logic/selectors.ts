import { IMainState } from "../model/IMainState";
import { IEntity, copyEntity } from "../model/entity.model";
import { IInputActions } from "../model/input.model";

export function getFullStateSelector(state: IMainState): IMainState {
    return state;
}

export function getLoadingSelector(state: IMainState): boolean {
    return state.loading;
}

export function getInputActionsSelector(state: IMainState): IInputActions {
    return state.input;
}

export interface ICopiedEntityCollection {
    allEntities: IEntity[];
    entityMap: Map<string, IEntity>;
    player: IEntity;
}
export function getCopiedEntitiesSelector(state: IMainState): ICopiedEntityCollection {
    let entityMap = new Map<string, IEntity>();
    let allEntities = state.entities.map((entity: IEntity) => {
        let newEntity = copyEntity(entity);
        entityMap.set(newEntity.id, newEntity);
        return newEntity;
    });
    return {
        allEntities: allEntities,
        entityMap: entityMap,
        player: allEntities.length > 0 && allEntities[0].id == state.playerId ? allEntities[0] : null
    }
}
