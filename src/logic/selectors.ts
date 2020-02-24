import { IMainState } from "../model/IMainState";
import { IEntity } from "../model/entity.model";
import { copyEntity } from "./util.logic";
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

export function getCopiedEntitiesSelector(state: IMainState): IEntity[] {
    return state.entities.map((entity: IEntity) => {
        return copyEntity(entity);
    });
}

export function getCopiedPlayerSelector(state: IMainState): IEntity {
    return copyEntity(state.player);
}
