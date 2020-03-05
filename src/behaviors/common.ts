import { IEntity, EntityType } from "../redux/state";
import { GameEvent, GameEventType, WorldCollisionEvent, InputActionEvent } from "../events/GameEvents";
import { MoveDirection, applyImpulseToEntity } from "./utils";
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
export function handleInputAction(behavior: any, event: GameEvent): void {
    const moveDirection = (event as InputActionEvent).direction;
    let b = behavior as IMovementBehaviorData;
    b.moveDirection = moveDirection;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON BEHAVIOR UPDATE METHODS
export function updateEntityMove(entity: IEntity, moveDirection: MoveDirection, speed: number): void {
    if (moveDirection == MoveDirection.Left) {
        entity.flip = true;
        applyImpulseToEntity(entity, createVector(-speed, 0));
    }
    else if (moveDirection == MoveDirection.Right) {
        entity.flip = false;
        applyImpulseToEntity(entity, createVector(speed, 0));
    }
}
export function updateEntityCollisionVelocity(entity: IEntity, collisionType: CollisionType): void {
    if (collisionType.hasCeilingCollision() || collisionType.hasFloorCollision()) {
        entity.velocity.y = 0;
    }
}
