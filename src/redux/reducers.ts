import { combineReducers, AnyAction } from "redux";
import { IMainState, IInputActions, ICamera, IMap, IEntity, ICollisionMap } from "./state";
import { InitState } from "./InitState";
import { LoadingAction, InputAction, CameraAction, MapAction, CollisionsAction, EntitiesAction } from "./actionTypes";
import { ICollisionSegment, cloneSegment } from "../physics/CollisionSegment";
import { copyEntity, copyCamera, deepCopy } from "../utils/creation";


const allReducers = combineReducers<IMainState>({
    loading: loadingReducer,
    input: inputReducer,
    camera: cameraReducer,
    map: mapReducer,
    staticCollisions: staticCollisionsReducer,
    entities: entitiesReducer,
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

export function mapReducer(state: IMap = InitState.map, action: AnyAction): IMap {
    switch (action.type) {
        case MapAction.Set:
            return Object.assign({}, action.payload);
        case MapAction.Clear:
            return null
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
