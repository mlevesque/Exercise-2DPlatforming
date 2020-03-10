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
    map: IMap;
    staticCollisions: ICollisionMap;
    entities: IEntity[];
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
// PROFILING
export interface IProfileData {
    frameTime: number;
    behaviorActionTime: number;
    physicsTime: number;
    behaviorReactionTime: number;
    animationTime: number;
    renderTime: number;
}
