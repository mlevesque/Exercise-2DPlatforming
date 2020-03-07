import { ICollisionSegment } from "../physics/CollisionSegment";
import { IVector } from "../utils/geometry";
import { ImpulseTarget } from "../behaviors/utils";
import { IBehaviorData } from "../behaviors/behaviorData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main State
export interface IMainState {
    loading: boolean;
    input: IInputActions;
    camera: ICamera;
    map: IMap;
    staticCollisions: ICollisionMap;
    entities: IEntity[];
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
export interface ICamera {
    width: number;
    height: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map
export interface IMap {
    tileset: string;
    tiles: number[][];
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
export interface IImpulse {
    impulse: IVector;
    timeRemaining: number;
    instant: boolean;
    target: ImpulseTarget;
}
export interface IImpulseMap {
    [type: string]: IImpulse;
}
export interface IEntity {
    id: string;
    type: EntityType;

    behavior: IBehaviorData;

    flip: boolean;
    currentAnimation: EntityAnimation;
    currentFrame: number;
    elapsedTime: number;

    impulses: IImpulseMap;
    velocity: IVector;
    prevPosition: IVector;
    position: IVector;
}
