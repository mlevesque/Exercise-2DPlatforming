import { IVector } from "../utils/geometry";
import { ISpriteAnimation } from "../animation/SpriteAnimation";
import { IMovementData } from "../physics/integration/MovementData";
import { ICameraConfig } from "../camera/Camera";
import { IBehavior } from "../behaviors/IBehavior";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main State
export interface IMainState {
    loading: boolean;
    input: IInputActions;
    cameraConfig: ICameraConfig;
    levelName: string;
    map: IMap;
    physics: IPhysicsConfig;
    staticCollisions: string[];
    entities: IEntityEntry[];
    renderConfig: IRenderConfig;
    configTab: ConfigTab;
    profileData: IProfileData;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Input
export enum InputType {
    Left = "Left",
    Right = "Right",
    Jump = "Jump",
    Reset = "Reset",
}
interface IInputSet {
    previous: boolean;
    current: boolean;
}
export interface IInputActions {
    [inputType: string]: IInputSet;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map
export interface IMap {
    tileset: string;
    background: string;
    backgroundParalax: IVector;
    tiles: number[][];
    width: number;
    height: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Physics
export interface IPhysicsConfig {
    gravity: IVector;
    originalGravity: IVector;
    segmentAttachEnabled: boolean;
    partitionCellWidth: number;
    partitionCellHeight: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entity
export enum EntityType {
    Player = "player",
}
export interface IEntityEntry {
    id: string;
    type: EntityType;
}
export interface IEntity {
    id: string;
    type: EntityType;

    behavior: IBehavior;

    spriteAnimation: ISpriteAnimation;

    movementData: IMovementData;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Render Config
export interface IRenderConfig {
    enableWhiteFade: boolean;
    enablePartition: boolean;
    enableCollisionSegments: boolean;
    enableFrameRate: boolean;
    enableCameraScroll: boolean;
    enableEntityCollisions: boolean;
    partitionSegmentId: string;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Config Tab
export enum ConfigTab {
    Level = 0,
    Physics = 1,
    Camera = 2,
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Profiling
export interface IProfileData {
    frameTime: number;
    behaviorActionTime: number;
    physicsTime: number;
    behaviorReactionTime: number;
    animationTime: number;
    renderTime: number;
}
