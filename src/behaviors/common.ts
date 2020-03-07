import { IEntity, EntityType } from "../redux/state";
import { GameEvent, GameEventType, WorldCollisionEvent } from "../events/GameEvents";
import { MoveDirection, applyImpulseToEntity, ImpulseType, ImpulseTarget } from "./utils";
import { CollisionType } from "../physics/collisionType";
import { createVector } from "../utils/geometry";
import { isFloor } from "../physics/util";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR DEFINITIONS
export type EntityEventHandleMap = Map<GameEventType, IHandleEntityEvent>;
export type EntityUpdateBehaviorMap = Map<EntityType, IUpdateEntityBehavior>;

export interface IHandleEntityEvent { (behavior: any, event: GameEvent): void }
export interface IUpdateEntityBehavior { (deltaT: number, entity: IEntity): void }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON BEHAVIOR DATA
export interface ICollisionBehaviorData {
    collisionType: number;
    segId: string;
}
export interface IMovementBehaviorData {
    moveDirection: MoveDirection;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON EVENT HANDLERS
export function handleWorldCollision(behavior: any, event: GameEvent): void {
    const collisionEvent = (event as WorldCollisionEvent);
    let b = behavior as ICollisionBehaviorData;
    b.collisionType = collisionEvent.collisionType.rawValue;

    // attach segment if we are on the ground
    if (collisionEvent.collisionType.hasFloorCollision()) {
        const seg = collisionEvent.collisionSegments.find(isFloor);
        b.segId = seg ? seg.id : "";
    }
    else {
        b.segId = "";
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON BEHAVIOR UPDATE METHODS
export function updateEntityMove(entity: IEntity, moveDirection: MoveDirection, speed: number): void {
    if (moveDirection == MoveDirection.Left) {
        entity.flip = true;
        applyImpulseToEntity(entity, ImpulseType.Walk, createVector(-speed, 0), 0, true, ImpulseTarget.Velocity);
    }
    else if (moveDirection == MoveDirection.Right) {
        entity.flip = false;
        applyImpulseToEntity(entity, ImpulseType.Walk, createVector(speed, 0), 0, true, ImpulseTarget.Velocity);
    }
}
export function updateEntityCollisionVelocity(entity: IEntity, collisionType: CollisionType): void {
    if ((collisionType.hasCeilingCollision() && entity.velocity.y < 0) 
        || (collisionType.hasFloorCollision()) && entity.velocity.y > 0) {
        entity.velocity.y = 0;
    }
}
