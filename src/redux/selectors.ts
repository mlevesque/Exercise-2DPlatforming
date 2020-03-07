import { IMainState, IInputActions, IEntity, EntityType, ICollisionMap, ICamera } from "./state";
import { ICollisionSegment } from "../physics/CollisionSegment";
import { copyEntity } from "../utils/creation";

export function getFullStateSelector(state: IMainState): IMainState {
    return state;
}

export function getLoadingSelector(state: IMainState): boolean {
    return state.loading;
}

export function getInputActionsSelector(state: IMainState): IInputActions {
    return state.input;
}

export function getStaticCollisions(state: IMainState): Map<string, ICollisionSegment> {
    return new Map<string, ICollisionSegment>(Object.entries(state.staticCollisions));
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
        player: allEntities.length > 0 && allEntities[0].type == EntityType.Player ? allEntities[0] : null
    }
}

export function getCamera(state: IMainState): ICamera {
    return state.camera;
}
