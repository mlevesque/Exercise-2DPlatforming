import { IMainState } from "../model/IMainState";
import { IEntity } from "../model/entity.model";

export function getFullState(state: IMainState): IMainState {
    return state;
}

export function getCopiedEntities(state: IMainState): IEntity[] {
    return state.entities.map((entity: IEntity) => {
        let newEntity = Object.assign({}, entity);
        newEntity.position = Object.assign({}, entity.position);
        return newEntity;
    });
}
