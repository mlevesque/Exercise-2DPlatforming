import { combineReducers, AnyAction } from "redux";
import { IMainState, IInputActions, ICamera, IMap, IEntity, ICollisionMap, IProfileData, IPhysicsConfig, ConfigTab, IRenderConfig } from "./state";
import { InitState } from "./InitState";
import { LoadingAction, InputAction, CameraAction, MapAction, CollisionsAction, EntitiesAction, ProfileAction, PhysicsConfigAction, ConfigTabAction, RenderConfigAction, LevelNameAction } from "./actionTypes";
import { ICollisionSegment, cloneSegment } from "../physics/CollisionSegment";
import { copyEntity, copyCamera, deepCopy } from "../utils/creation";
import { cloneVector } from "../utils/geometry";


const allReducers = combineReducers<IMainState>({
    loading: loadingReducer,
    input: inputReducer,
    camera: cameraReducer,
    levelName: levelNameReducer,
    map: mapReducer,
    physics: physicsConfigReducer,
    staticCollisions: staticCollisionsReducer,
    entities: entitiesReducer,
    renderConfig: renderConfigReducer,
    configTab: configTabReducer,
    profileData: profileReducer,
});
export default allReducers;


export function loadingReducer(state: boolean = InitState.loading, action: AnyAction): boolean {
    switch(action.type) {
        case LoadingAction.SetFlag:
            return action.payload;
    }
    return state;
}

export function inputReducer(state: IInputActions = InitState.input, action: AnyAction): IInputActions {
    let newState: IInputActions;
    switch(action.type) {
        case InputAction.Set:
            newState = Object.assign({}, state);
            newState[action.payload.type].current = action.payload.state;
            return newState;
        case InputAction.Update:
            newState = Object.assign({}, state);
            for (const key in newState) {
                newState[key].previous = newState[key].current;
            }
            return newState;
    }
    return state;
}

export function cameraReducer(state: ICamera = InitState.camera, action: AnyAction): ICamera {
    let newState: ICamera;
    switch (action.type) {
        case CameraAction.Resize:
            newState = copyCamera(state);
            newState.halfWidth = action.payload.width / 2;
            newState.halfHeight = action.payload.height / 2;
            return newState;
        case CameraAction.SetPositioning:
            newState = copyCamera(state);
            newState.positionData = deepCopy(action.payload.positionData);
            return newState;
        case CameraAction.SetLocks:
            newState = copyCamera(state);
            newState.lockX = action.payload.lockX;
            newState.lockY = action.payload.lockY;
            return newState;
        case CameraAction.SetScrollArea:
            newState = copyCamera(state);
            newState.scrollArea = deepCopy(action.payload.scrollArea);
            return newState;
    }
    return state;
}

export function levelNameReducer(state: string = InitState.levelName, action: AnyAction): string {
    switch (action.type) {
        case LevelNameAction.Set:
            return action.payload;
    }
    return state;
}

export function mapReducer(state: IMap = InitState.map, action: AnyAction): IMap {
    switch (action.type) {
        case MapAction.Set:
            return Object.assign({}, action.payload);
        case MapAction.Clear:
            return null
    }
    return state;
}

export function physicsConfigReducer(state: IPhysicsConfig = InitState.physics, action: AnyAction): IPhysicsConfig {
    let newState: IPhysicsConfig;
    switch (action.type) {
        case PhysicsConfigAction.SetGravity:
            newState = deepCopy(state);
            newState.gravity = cloneVector(action.payload.gravity);
            if (action.payload.setOriginal) {
                newState.originalGravity = cloneVector(newState.gravity);
            }
            return newState;
        case PhysicsConfigAction.ResetGravity:
            newState = deepCopy(state);
            newState.gravity = cloneVector(newState.originalGravity);
            return newState;
        case PhysicsConfigAction.SetAttachSegmentEnabled:
            newState = deepCopy(state);
            newState.segmentAttachEnabled = action.payload;
            return newState;
        case PhysicsConfigAction.SetPartitionCellSize:
            newState = deepCopy(state);
            newState.partitionCellWidth = action.payload.width;
            newState.partitionCellHeight = action.payload.height;
            return newState;
    }
    return state;
}

export function staticCollisionsReducer( state: ICollisionMap = InitState.staticCollisions, 
                                         action: AnyAction): ICollisionMap {
    let newMap: ICollisionMap;
    switch (action.type) {
        case CollisionsAction.SetStatic:
            newMap = {};
            const arr: Map<string, ICollisionSegment> = action.payload;
            arr.forEach((segment: ICollisionSegment) => {
                const newSegment = cloneSegment(segment);
                newMap[newSegment.id] = newSegment;
            });
            return newMap;
        case CollisionsAction.Clear:
            return {};
    }
    return state;
}

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

export function renderConfigReducer(state: IRenderConfig = InitState.renderConfig, action: AnyAction): IRenderConfig {
    let newState: IRenderConfig;
    switch (action.type) {
        case RenderConfigAction.SetWhiteFade:
            newState = deepCopy(state);
            newState.enableWhiteFade = action.payload;
            return newState;
        case RenderConfigAction.SetPartition:
            newState = deepCopy(state);
            newState.enablePartition = action.payload;
            return newState;
        case RenderConfigAction.SetCollisionSegment:
            newState = deepCopy(state);
            newState.enableCollisionSegments = action.payload;
            return newState;
        case RenderConfigAction.SetFrameRate:
            newState = deepCopy(state);
            newState.enableFrameRate = action.payload;
            return newState;
        case RenderConfigAction.SetCameraScroll:
            newState = deepCopy(state);
            newState.enableCameraScroll = action.payload;
            return newState;
        case RenderConfigAction.SetEntityCollisions:
            newState = deepCopy(state);
            newState.enableEntityCollisions = action.payload;
            return newState;
    }
    return state;
}

export function configTabReducer(state: ConfigTab = InitState.configTab, action: AnyAction): ConfigTab {
    switch (action.type) {
        case ConfigTabAction.SetTab:
            return action.payload;
    }
    return state;
}

export function profileReducer(state: IProfileData = InitState.profileData, action: AnyAction): IProfileData {
    switch (action.type) {
        case ProfileAction.Set:
            return Object.assign({}, action.payload);
    }
    return state;
}
