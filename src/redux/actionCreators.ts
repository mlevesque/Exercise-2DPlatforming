import { AnyAction } from "redux";
import { GameAction, 
         CameraAction, 
         CollisionsAction, 
         EntitiesAction, 
         InputAction, 
         LoadingAction, 
         MapAction, 
         ProfileAction} from "./actionTypes";
import { ICollisionSegment } from "../physics/CollisionSegment";
import { IEntity, InputType, IMap, IScrollArea, IProfileData } from "./state";
import { IPositionData } from "../physics/movementData";

export function createAction(type: string, payload: Object = null): AnyAction {
    return {type: type, payload: payload};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Misc Game Actions
export function actionGameUpdate(deltaTime: number): AnyAction {
    return createAction(GameAction.Update, deltaTime);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Camera
export function actionCameraResize(width: number, height: number): AnyAction {
    return createAction(CameraAction.Resize, {width: width, height: height});
}
export function actionCameraSetPosition(positionData: IPositionData): AnyAction {
    return createAction(CameraAction.SetPositioning, {positionData: positionData});
}
export function actionCameraSetLocks(lockX: boolean, lockY: boolean): AnyAction {
    return createAction(CameraAction.SetLocks, {lockX: lockX, lockY: lockY});
}
export function actionCameraSetScrollArea(scrollArea: IScrollArea): AnyAction {
    return createAction(CameraAction.SetScrollArea, {scrollArea: scrollArea});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collisions
export function actionSetStaticCollisions(collisions: Map<string, ICollisionSegment>): AnyAction {
    return createAction(CollisionsAction.SetStatic, collisions);
}
export function actionClearCollisions(): AnyAction {
    return createAction(CollisionsAction.Clear);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entities
export function actionSetEntitiesCollection(entities: IEntity[]): AnyAction {
    return createAction(EntitiesAction.SetCollection, entities);
}
export function actionClearEntities(): AnyAction {
    return createAction(EntitiesAction.Clear);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Input
export function actionSetInput(type: InputType, state: boolean): AnyAction {
    return createAction(InputAction.Set, {type: type, state: state});
}
export function actionUpdateInput(): AnyAction {
    return createAction(InputAction.Update);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loading
export function actionSetLoadingFlag(flag: boolean): AnyAction {
    return createAction(LoadingAction.SetFlag, flag);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map
export function actionSetMap(map: IMap): AnyAction {
    return createAction(MapAction.Set, map);
}
export function actionClearMap(): AnyAction {
    return createAction(MapAction.Clear);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Profile
export function actionSetProfile(profileData: IProfileData): AnyAction {
    return createAction(ProfileAction.Set, profileData);
}
