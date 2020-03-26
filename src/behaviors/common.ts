import { IEntity, EntityType } from "../redux/state";
import { GameEvent, GameEventType, WorldCollisionEvent } from "../events/GameEvents";
import { MoveDirection } from "./utils";
import { CollisionType } from "../physics/collisions/collisionType";
import { createVector } from "../utils/geometry";
import { isFloor } from "../physics/util";
import { IBehaviorData, getBehaviorCollision } from "./behaviorData";
import { ImpulseType } from "../physics/integration/MovementData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR DEFINITIONS
export type EntityEventHandleMap = Map<GameEventType, IHandleEntityEvent>;
export type EntityUpdateBehaviorMap = Map<EntityType, IUpdateEntityBehavior>;

export interface IHandleEntityEvent { (behavior: IBehaviorData, event: GameEvent): void }
export interface IUpdateEntityBehavior { (deltaT: number, entity: IEntity): void }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON EVENT HANDLERS
export function handleWorldCollision(behavior: IBehaviorData, event: GameEvent): void {
    const collisionEvent = (event as WorldCollisionEvent);
    let collisionBehavior = getBehaviorCollision(behavior);
    collisionBehavior.collisionType = collisionEvent.collisionType.rawValue;

    // attach segment if we are on the ground
    if (collisionEvent.collisionType.hasFloorCollision()) {
        const seg = collisionEvent.collisionSegments.find(isFloor);
        collisionBehavior.segId = seg ? seg.id : "";
    }
    else {
        collisionBehavior.segId = "";
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// COMMON BEHAVIOR UPDATE METHODS
export function updateEntityMove(deltaT: number, entity: IEntity, moveDirection: MoveDirection, speed: number): void {
    const movement = entity.movementData;
    if (moveDirection == MoveDirection.Left) {
        entity.spriteAnimation.setFlip(true);
        entity.movementData.applyPositionShift(ImpulseType.Walk, createVector(-speed, 0), deltaT);
    }
    else if (moveDirection == MoveDirection.Right) {
        entity.spriteAnimation.setFlip(false);
        entity.movementData.applyPositionShift(ImpulseType.Walk, createVector(speed, 0), deltaT);
    }
}
export function updateEntityCollisionVelocity(entity: IEntity, collisionType: CollisionType): void {
    if ((collisionType.hasCeilingCollision() && entity.movementData.velocity.y < 0) 
        || (collisionType.hasFloorCollision()) && entity.movementData.velocity.y > 0) {
        entity.movementData.setVelocity(createVector(entity.movementData.velocity.x, 0));
    }
}
