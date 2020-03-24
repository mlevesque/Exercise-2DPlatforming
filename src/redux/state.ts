import { ICollisionSegment } from "../physics/CollisionSegment";
import { IBehaviorData } from "../behaviors/behaviorData";
import { IPositionData } from "../physics/movementData";
import { IVector } from "../utils/geometry";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main State
export interface IMainState {
    loading: boolean;
    input: IInputActions;
    camera: ICamera;
    levelName: string;
    map: IMap;
    physics: IPhysicsConfig;
    staticCollisions: ICollisionMap;
    entities: IEntity[];
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
// Camera
export interface IScrollArea {
    radius: number;
    spring: number;
    dampen: number;
}
export interface ICamera {
    halfWidth: number;
    halfHeight: number;
    lockX: boolean;
    lockY: boolean;
    scrollArea: IScrollArea;
    positionData: IPositionData;
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
// Collisions
export interface ICollisionMap {
    [id: string]: ICollisionSegment;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entity
export enum EntityType {
    Player = "player",
}
export enum EntityAnimation {
    Idle = "idle",
    Walk = "walk",
    Jump = "jump",
    Fall = "fall",
    JumpFall = "jumpFall",
}
export interface IEntity {
    id: string;
    type: EntityType;

    behavior: IBehaviorData;

    flip: boolean;
    currentAnimation: EntityAnimation;
    currentFrame: number;
    elapsedTime: number;

    positionData: IPositionData;
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
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONFIG TAB
export enum ConfigTab {
    Level = 0,
    Physics = 1,
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PROFILING
export interface IProfileData {
    frameTime: number;
    behaviorActionTime: number;
    physicsTime: number;
    behaviorReactionTime: number;
    animationTime: number;
    renderTime: number;
}
