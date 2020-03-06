import { ICollisionBehaviorData, EntityEventHandleMap, updateEntityMove, updateEntityCollisionVelocity, 
    IMovementBehaviorData, handleWorldCollision } from "./common";
import { GameEventType, InputActionEvent, GameEvent } from "../events/GameEvents";
import { IEntity, EntityAnimation } from "../redux/state";
import { changeAnimationOnEntity, MoveDirection, applyImpulseToEntity, ImpulseType, ImpulseTarget, 
    removeImpulse } from "./utils";
import { CollisionFlag, CollisionType } from "../physics/collisionType";
import { getEntityJsonData, IPlayerSchema, IJumpDuration } from "../utils/jsonSchemas";
import { createVector } from "../utils/geometry";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR DATA
export interface IPlayerBehavior extends ICollisionBehaviorData, IMovementBehaviorData {
    jumpPressed: boolean;
    jumping: boolean;
    jumpDuration: number;
    jumpKeyElapsedTime: number;
}

export function createPlayerBehaviorData(): IPlayerBehavior {
    return {
        moveDirection: MoveDirection.None,
        jumpPressed: false,
        jumping: false,
        jumpKeyElapsedTime: 0,
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
// EVENTS HANDLERS
export function handleInputAction(behavior: any, event: GameEvent): void {
    const inputEvent = event as InputActionEvent;
    let b = behavior as IPlayerBehavior;

    // handle move
    b.moveDirection = inputEvent.direction;

    // handle jump
    b.jumpPressed = inputEvent.jump;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACTION UPDATE
function getJumpDuration(jumpDuration: number, initialDuration: number, jumpEntries: IJumpDuration[]): number {
    let entry: IJumpDuration = null;
    for (let i = jumpEntries.length - 1; i >= 0; --i) {
        if (jumpDuration >= jumpEntries[i].keyDuration) {
            entry = jumpEntries[i];
        }
    }
    if (entry) {
        return entry.impulseDuration;
    }
    return initialDuration;
}
export function updatePlayerActionBehavior(deltaT: number, player: IEntity): void {
    const behavior = player.behavior as IPlayerBehavior;
    const entityData = getEntityJsonData(player.type) as IPlayerSchema;

    // set left and right movement
    updateEntityMove(player, behavior.moveDirection, entityData.speed);

    // handle jump
    const collisionType = new CollisionType(behavior.collisionType);
    if (behavior.jumpPressed) {
        if (collisionType.hasFloorCollision()) {
            behavior.jumping = true;
            behavior.jumpKeyElapsedTime = 0;
        }
    }
    else {
        behavior.jumpKeyElapsedTime = 0;
    }

    // apply jump impulse
    if (behavior.jumping) {
        const speed = entityData.jump.speed;
        const jump = entityData.jump;
        const duration = getJumpDuration(behavior.jumpKeyElapsedTime, jump.initialDuration, jump.additionalDurations);
        if (duration > behavior.jumpDuration) {
            applyImpulseToEntity(
                player, 
                ImpulseType.Jump, 
                createVector(0, -speed), 
                duration - behavior.jumpDuration, 
                false, 
                ImpulseTarget.Acceleration
            );
            behavior.jumpDuration = duration;
        }
        behavior.jumpKeyElapsedTime += deltaT;
    }
    else {
        behavior.jumpDuration = 0;
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
            behavior.jumping = false;
        }
        else if (behavior.jumping) {
            changeAnimationOnEntity(player, EntityAnimation.Jump, false);
        }
    }

    if (collisionType.hasCeilingCollision()) {
        removeImpulse(player, ImpulseType.Jump);
    }
}
