import { AnyAction } from "redux";
import { GameAction, 
         CameraAction, 
         CollisionsAction, 
         EntitiesAction, 
         InputAction, 
         LoadingAction, 
         MapAction } from "./actionTypes";
import { ICollisionSegment } from "../physics/CollisionSegment";
import { IEntity, InputType, IMap } from "./state";
import { IVector } from "../utils/geometry";

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
export function actionCameraSetPosition(position: IVector): AnyAction {
    return createAction(CameraAction.SetPosition, {position: position});
}
export function actionCameraSetLocks(lockX: boolean, lockY: boolean): AnyAction {
    return createAction(CameraAction.SetLocks, {lockX: lockX, lockY: lockY});
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
