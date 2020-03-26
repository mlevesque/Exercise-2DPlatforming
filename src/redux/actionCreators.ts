import { AnyAction } from "redux";
import { GameAction, CameraAction, CollisionsAction, EntitiesAction, InputAction, LoadingAction, MapAction, 
    ProfileAction, PhysicsConfigAction, ConfigTabAction, RenderConfigAction, LevelNameAction} from "./actionTypes";
import { IEntity, InputType, IMap, IScrollArea, IProfileData, ConfigTab, IEntityEntry } from "./state";
import { IPositionData } from "../physics/integration/movementData";
import { IVector } from "../utils/geometry";

export function createAction(type: string, payload: Object = null): AnyAction {
    return {type: type, payload: payload};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Misc Game Actions
export function actionLoadLevel(levelName: string): AnyAction {
    return createAction(GameAction.Load, levelName);
}
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
// Physics
export function actionSetGravity(gravity: IVector, setOriginal: boolean = false): AnyAction {
    return createAction(PhysicsConfigAction.SetGravity, {gravity: gravity, setOriginal: setOriginal});
}
export function actionResetGravity(): AnyAction {
    return createAction(PhysicsConfigAction.ResetGravity);
}
export function actionSetAttachSegmentEnabled(flag: boolean): AnyAction {
    return createAction(PhysicsConfigAction.SetAttachSegmentEnabled, flag);
}
export function actionSetPartitionCellSize(width: number, height: number): AnyAction {
    return createAction(PhysicsConfigAction.SetPartitionCellSize, {width: width, height: height});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Collisions
export function actionSetStaticCollisions(collisions: string[]): AnyAction {
    return createAction(CollisionsAction.SetStatic, collisions);
}
export function actionClearCollisions(): AnyAction {
    return createAction(CollisionsAction.Clear);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entities
export function actionSetEntitiesCollection(entities: IEntityEntry[]): AnyAction {
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
// Level Name
export function actionSetLevelName(name: string): AnyAction {
    return createAction(LevelNameAction.Set, name);
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
// Render Config
export function actionShowWhiteFade(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetWhiteFade, val);
}
export function actionShowPartition(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetPartition, val);
}
export function actionShowCollisionSegment(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetCollisionSegment, val);
}
export function actionShowFrameRate(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetFrameRate, val);
}
export function actionShowCameraScroll(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetCameraScroll, val);
}
export function actionShowEntityCollisions(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetEntityCollisions, val);
}
export function actionSetPartitionSegmentId(id: string): AnyAction {
    return createAction(RenderConfigAction.SetPartitionSegmentId, id);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Config Tab
export function actionSetConfigTab(tab: ConfigTab): AnyAction {
    return createAction(ConfigTabAction.SetTab, tab);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Profile
export function actionSetProfile(profileData: IProfileData): AnyAction {
    return createAction(ProfileAction.Set, profileData);
}
