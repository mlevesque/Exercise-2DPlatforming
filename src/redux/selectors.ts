import { IMainState, IInputActions, IMap, IProfileData, IPhysicsConfig, IRenderConfig, IEntityEntry} 
    from "./state";
import { deepCopy } from "../utils/creation";
import { ICameraConfig } from "../camera/Camera";

export function getFullStateSelector(state: IMainState): IMainState {
    return state;
}

export function getLoadingSelector(state: IMainState): boolean {
    return state.loading;
}

export function getInputActionsSelector(state: IMainState): IInputActions {
    return state.input;
}

export function getEntityEntries(state: IMainState): IEntityEntry[] {
    return state.entities;
}

export function getCameraConfig(state: IMainState): ICameraConfig {
    return state.cameraConfig;
}

export function getLevelName(state: IMainState): string {
    return state.levelName;
}

export function getMap(state: IMainState): IMap {
    return state.map;
}

export function getPhysicsConfig(state: IMainState): IPhysicsConfig {
    return state.physics;
}

export function getRenderConfig(state: IMainState): IRenderConfig {
    return state.renderConfig;
}

export function getProfile(state: IMainState): IProfileData {
    return deepCopy(state.profileData);
}
