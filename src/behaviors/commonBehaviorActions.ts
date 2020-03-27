import { IEntity } from "../redux/state";
import { CollisionType } from "../physics/collisions/collisionType";
import { createVector } from "../utils/geometry";
import { ImpulseType } from "../physics/integration/MovementData";
import { MoveDirection } from "./BehaviorComponents";

/**
 * Common entity movement handling.
 * @param deltaT 
 * @param entity 
 * @param moveDirection 
 * @param speed 
 */
export function updateEntityMove(deltaT: number, entity: IEntity, moveDirection: MoveDirection, speed: number): void {
    if (moveDirection == MoveDirection.Left) {
        entity.spriteAnimation.setFlip(true);
        entity.movementData.applyPositionShift(ImpulseType.Walk, createVector(-speed, 0), deltaT);
    }
    else if (moveDirection == MoveDirection.Right) {
        entity.spriteAnimation.setFlip(false);
        entity.movementData.applyPositionShift(ImpulseType.Walk, createVector(speed, 0), deltaT);
    }
}

/**
 * Common handling of an entity's velocity based on world collision.
 * @param entity 
 * @param collisionType 
 */
export function updateEntityCollisionVelocity(entity: IEntity, collisionType: CollisionType): void {
    if ((collisionType.hasCeilingCollision() && entity.movementData.velocity.y < 0) 
        || (collisionType.hasFloorCollision()) && entity.movementData.velocity.y > 0) {
        entity.movementData.setVelocity(createVector(entity.movementData.velocity.x, 0));
    }
}
