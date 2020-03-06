import { ICollisionBehaviorData, EntityEventHandleMap, updateEntityMove, updateEntityCollisionVelocity, 
    IMovementBehaviorData, handleWorldCollision, handleInputAction } from "./common";
import { GameEventType } from "../events/GameEvents";
import { IEntity, EntityAnimation } from "../redux/state";
import { changeAnimationOnEntity, MoveDirection, applyImpulseToEntity, ImpulseType, ImpulseTarget, 
    removeImpulse } from "./utils";
import { CollisionFlag, CollisionType } from "../physics/collisionType";
import { getEntityJsonData, IPlayerSchema } from "../utils/jsonSchemas";
import { createVector } from "../utils/geometry";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR DATA
export interface IPlayerBehavior extends ICollisionBehaviorData, IMovementBehaviorData {}

export function createPlayerBehaviorData(): IPlayerBehavior {
    return {
        moveDirection: MoveDirection.None,
        jumpPressed: false,
        jumping: false,
        jumpDuration: 0,
        collisionType: CollisionFlag.None,
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLER MAPPING
export const playerEventHandlerMapping: EntityEventHandleMap = new Map([
    [GameEventType.WorldCollision, handleWorldCollision],
    [GameEventType.InputAction, handleInputAction],
])


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACTION UPDATE
export function updatePlayerActionBehavior(deltaT: number, player: IEntity): void {
    const behavior = player.behavior as IPlayerBehavior;
    const entityData = getEntityJsonData(player.type) as IPlayerSchema;

    // set left and right movement
    updateEntityMove(player, behavior.moveDirection, entityData.speed);

    // set jump
    const collisionType = new CollisionType(behavior.collisionType);
    if (behavior.jumpPressed) {
        if (collisionType.hasFloorCollision()) {
            const speed = entityData.jump.speed;
            const duration = entityData.jump.duration;
            applyImpulseToEntity(
                player, 
                ImpulseType.Jump, 
                createVector(0, -speed), 
                duration, 
                false, 
                ImpulseTarget.Acceleration
            );
            behavior.jumping = true;
            behavior.jumpDuration = 0;
        }
        else {
            behavior.jumpDuration += deltaT;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REACTION UPDATE
export function updatePlayerReactionBehavior(deltaT: number, player: IEntity): void {
    const behavior = player.behavior as IPlayerBehavior;
    const collisionType = new CollisionType(behavior.collisionType);

    updateEntityCollisionVelocity(player, collisionType);

    if (collisionType.hasFloorCollision()) {
        behavior.jumping = false;
        if (behavior.moveDirection == MoveDirection.Left || behavior.moveDirection == MoveDirection.Right) {
            changeAnimationOnEntity(player, EntityAnimation.Walk, false);
        }
        else {
            changeAnimationOnEntity(player, EntityAnimation.Idle, false);
        }
    }
    else {
        if (player.velocity.y > 0) {
            if (behavior.jumping) {
                changeAnimationOnEntity(player, EntityAnimation.JumpFall, false);
            }
            else {
                changeAnimationOnEntity(player, EntityAnimation.Fall, false);
            }
        }
        else if (behavior.jumping) {
            changeAnimationOnEntity(player, EntityAnimation.Jump, false);
        }
    }

    if (collisionType.hasCeilingCollision()) {
        removeImpulse(player, ImpulseType.Jump);
    }
}
