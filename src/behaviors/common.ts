import { IEntity, EntityType } from "../redux/state";
import { GameEvent, GameEventType, WorldCollisionEvent } from "../events/GameEvents";
import { MoveDirection, applyImpulseToEntity, ImpulseType, ImpulseTarget } from "./utils";
import { CollisionType } from "../physics/collisionType";
import { createVector } from "../utils/geometry";

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
}
export interface IMovementBehaviorData {
    moveDirection: MoveDirection;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON EVENT HANDLERS
export function handleWorldCollision(behavior: any, event: GameEvent): void {
    const collisionType = (event as WorldCollisionEvent).collisionType;
    let b = behavior as ICollisionBehaviorData;
    b.collisionType = collisionType.rawValue;
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
