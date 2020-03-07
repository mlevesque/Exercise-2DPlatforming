import { MoveDirection } from "./utils";

enum BehaviorType {
    Collision = "collision",
    Movement = "movement",
    Jump = "jump",
}

export interface IBehaviorData {
    [type: string]: any;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMPONENTS
export interface IBehaviorCollision {
    collisionType: number;
    segId: string;
}
export interface IBehaviorMovement {
    moveDirection: MoveDirection;
}
export interface IBehaviorJump {
    jumpPressed: boolean;
    jumping: boolean;
    jumpDuration: number;
    jumpKeyElapsedTime: number;
    onGround: boolean;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GETTERS
export function getBehaviorCollision(b: IBehaviorData): IBehaviorCollision {return b[BehaviorType.Collision]}
export function getBehaviorMovement(b: IBehaviorData): IBehaviorMovement {return b[BehaviorType.Movement]}
export function getBehaviorJump(b: IBehaviorData): IBehaviorJump {return b[BehaviorType.Jump]}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SETTERS
export function setBehaviorCollision(b: IBehaviorData, c:IBehaviorCollision): void {b[BehaviorType.Collision] = c}
export function setBehaviorMovement(b: IBehaviorData, c:IBehaviorMovement): void {b[BehaviorType.Movement] = c}
export function setBehaviorJump(b: IBehaviorData, c:IBehaviorJump): void {b[BehaviorType.Jump] = c}
