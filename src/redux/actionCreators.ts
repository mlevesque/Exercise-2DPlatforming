import { AnyAction } from "redux";
import { GameAction, CameraAction, CollisionsAction, EntitiesAction, InputAction, LoadingAction, MapAction, 
    ProfileAction, PhysicsConfigAction, ConfigTabAction, RenderConfigAction, LevelNameAction} from "./actionTypes";
import { InputType, IMap, IProfileData, ConfigTab, IEntityEntry } from "./state";
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
export function actionCameraSetLocks(lockX: boolean, lockY: boolean): AnyAction {
    return createAction(CameraAction.SetLocks, {lockX: lockX, lockY: lockY});
}
export function actionCameraSetScrollArea(radius: number, spring: number, dampen: number): AnyAction {
    return createAction(CameraAction.SetScrollArea, {radius: radius, spring: spring, dampen: dampen});
}
export function actionCameraSetWorldConstraints(value: boolean): AnyAction {
    return createAction(CameraAction.SetWorldConstraints, value);
}
export function actionCameraSetEntityTarget(id: string): AnyAction {
    return createAction(CameraAction.SetEntityTarget, id);
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
export function actionSetMapTextures(tileset: string, background: string): AnyAction {
    return createAction(MapAction.SetTextures, {tileset: tileset, background: background});
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
export function actionHighlightAttachSegment(val: boolean): AnyAction {
    return createAction(RenderConfigAction.SetAttachSegment, val);
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
