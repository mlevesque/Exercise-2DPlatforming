import { ICollisionSegment } from "../physics/CollisionSegment";
import { IVector } from "../utils/geometry";
import { IBehaviorData } from "../behaviors/behaviorData";
import { IMovementData } from "../physics/movementData";

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
export interface IScrollArea {
    verticalRadius: number;
    horizontalRadius: number;
    spring: number;
    dampen: number;
}
export interface ICamera {
    halfWidth: number;
    halfHeight: number;
    velocity: IVector;
    position: IVector;
    lockX: boolean;
    lockY: boolean;
    scrollArea: IScrollArea;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map
export interface IMap {
    tileset: string;
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

    movement: IMovementData;
}
