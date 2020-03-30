import { combineReducers, AnyAction } from "redux";
import { IMainState, IInputActions, IMap, IProfileData, IPhysicsConfig, ConfigTab, IRenderConfig, 
    IEntityEntry} from "./state";
import { InitState } from "./InitState";
import { LoadingAction, InputAction, CameraAction, MapAction, CollisionsAction, EntitiesAction, ProfileAction, 
    PhysicsConfigAction, ConfigTabAction, RenderConfigAction, LevelNameAction } from "./actionTypes";
import { deepCopy } from "../utils/creation";
import { cloneVector } from "../utils/geometry";
import { ICameraConfig } from "../camera/Camera";


const allReducers = combineReducers<IMainState>({
    loading: loadingReducer,
    input: inputReducer,
    cameraConfig: cameraReducer,
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

export function cameraReducer(state: ICameraConfig = InitState.cameraConfig, action: AnyAction): ICameraConfig {
    let newState: ICameraConfig;
    switch (action.type) {
        case CameraAction.Resize:
            newState = deepCopy(state);
            newState.halfWidth = action.payload.width / 2;
            newState.halfHeight = action.payload.height / 2;
            return newState;
        case CameraAction.SetLocks:
            newState = deepCopy(state);
            newState.lockX = action.payload.lockX;
            newState.lockY = action.payload.lockY;
            return newState;
        case CameraAction.SetScrollArea:
            newState = deepCopy(state);
            newState.radius = action.payload.radius;
            newState.spring = action.payload.spring;
            newState.dampen = action.payload.dampen;
            return newState;
        case CameraAction.SetWorldConstraints:
            newState = deepCopy(state);
            newState.worldConstraints = action.payload;
            return newState;
        case CameraAction.SetEntityTarget:
            newState = deepCopy(state);
            newState.entityTarget = action.payload;
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
            return deepCopy(action.payload);
        case MapAction.Clear:
            return null
        case MapAction.SetTextures:
            if (state) {
                const newState: IMap = deepCopy(state);
                newState.tileset = action.payload.tileset;
                newState.background = action.payload.background;
                return newState;
            }
            else {
                return null;
            }
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

export function staticCollisionsReducer( state: string[] = InitState.staticCollisions, action: AnyAction): string[] {
    switch (action.type) {
        case CollisionsAction.SetStatic:
            return [...action.payload];
        case CollisionsAction.Clear:
            return [];
    }
    return state;
}

export function entitiesReducer(state: IEntityEntry[] = InitState.entities, action: AnyAction): IEntityEntry[] {
    switch (action.type) {
        case EntitiesAction.SetCollection:
            return action.payload.map((entity: IEntityEntry) => Object.assign({}, entity));
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
        case RenderConfigAction.SetPartitionSegmentId:
            newState = deepCopy(state);
            newState.partitionSegmentId = action.payload;
            return newState;
        case RenderConfigAction.SetAttachSegment:
            newState = deepCopy(state);
            newState.enableAttachCollision = action.payload;
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
