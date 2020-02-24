import { IMainState } from "../model/IMainState";
import { IEntity } from "../model/entity.model";
import { copyEntity } from "./util.logic";
import { IInputActions } from "../model/input.model";

export function getFullState(state: IMainState): IMainState {
    return state;
}

export function getInputActions(state: IMainState): IInputActions {
    return state.input;
}

export function getCopiedEntities(state: IMainState): IEntity[] {
    return state.entities.map((entity: IEntity) => {
        return copyEntity(entity);
    });
}

export function getCopiedPlayer(state: IMainState): IEntity {
    return copyEntity(state.player);
}
