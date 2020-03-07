import { EntityEventHandleMap, updateEntityMove, updateEntityCollisionVelocity, handleWorldCollision } from "./common";
import { GameEventType, InputActionEvent, GameEvent } from "../events/GameEvents";
import { IEntity, EntityAnimation } from "../redux/state";
import { changeAnimationOnEntity, MoveDirection, applyImpulseToEntity, ImpulseType, ImpulseTarget, 
    removeImpulse } from "./utils";
import { CollisionFlag, CollisionType } from "../physics/collisionType";
import { getEntityJsonData, IPlayerSchema, IJumpDuration } from "../utils/jsonSchemas";
import { createVector } from "../utils/geometry";
import { IBehaviorData, setBehaviorCollision, setBehaviorMovement, setBehaviorJump, getBehaviorMovement, 
    getBehaviorJump, 
    getBehaviorCollision} from "./behaviorData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR CREATION
export function createPlayerBehaviorData(): IBehaviorData {
    let behavior: IBehaviorData = {};
    setBehaviorCollision(behavior, {
        collisionType: 0,
        segId: ""
    });
    setBehaviorMovement(behavior, {
        moveDirection: MoveDirection.None
    })
    setBehaviorJump(behavior, {
        jumpPressed: false,
        jumping: false,
        jumpDuration: 0,
        jumpKeyElapsedTime: 0
    })
    return behavior;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLER MAPPING
export const playerEventHandlerMapping: EntityEventHandleMap = new Map([
    [GameEventType.WorldCollision, handleWorldCollision],
    [GameEventType.InputAction, handleInputAction],
])


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENTS HANDLERS
export function handleInputAction(behavior: IBehaviorData, event: GameEvent): void {
    const inputEvent = event as InputActionEvent;
    let moveBehavior = getBehaviorMovement(behavior);
    let jumpBehavior = getBehaviorJump(behavior);

    // handle move
    moveBehavior.moveDirection = inputEvent.direction;

    // handle jump
    jumpBehavior.jumpPressed = inputEvent.jump;
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
    const entityData = getEntityJsonData(player.type) as IPlayerSchema;

    // set left and right movement
    let moveBehavior = getBehaviorMovement(player.behavior);
    updateEntityMove(player, moveBehavior.moveDirection, entityData.speed);

    // handle jump
    let jumpBehavior = getBehaviorJump(player.behavior);
    let collisionBehavior = getBehaviorCollision(player.behavior);
    const collisionType = new CollisionType(collisionBehavior.collisionType);
    if (jumpBehavior.jumpPressed) {
        if (collisionType.hasFloorCollision()) {
            jumpBehavior.jumping = true;
            jumpBehavior.jumpKeyElapsedTime = 0;

            // detach segment
            collisionBehavior.segId = "";
        }
    }
    else {
        jumpBehavior.jumpKeyElapsedTime = 0;
    }

    // apply jump impulse
    if (jumpBehavior.jumping) {
        const speed = entityData.jump.speed;
        const jump = entityData.jump;
        const d = getJumpDuration(jumpBehavior.jumpKeyElapsedTime, jump.initialDuration, jump.additionalDurations);
        if (d > jumpBehavior.jumpDuration) {
            applyImpulseToEntity(
                player, 
                ImpulseType.Jump, 
                createVector(0, -speed), 
                d - jumpBehavior.jumpDuration, 
                false, 
                ImpulseTarget.Acceleration
            );
            jumpBehavior.jumpDuration = d;
        }
        jumpBehavior.jumpKeyElapsedTime += deltaT;
    }
    else {
        jumpBehavior.jumpDuration = 0;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REACTION UPDATE
export function updatePlayerReactionBehavior(deltaT: number, player: IEntity): void {
    // update velocity upon collisions
    const collisionBehavior = getBehaviorCollision(player.behavior);
    const collisionType = new CollisionType(collisionBehavior.collisionType);
    updateEntityCollisionVelocity(player, collisionType);

    // handle animation triggers
    let jumpBehavior = getBehaviorJump(player.behavior);
    let moveBehavior = getBehaviorMovement(player.behavior);
    if (collisionType.hasFloorCollision()) {
        jumpBehavior.jumping = false;
        if (moveBehavior.moveDirection == MoveDirection.Left || moveBehavior.moveDirection == MoveDirection.Right) {
            changeAnimationOnEntity(player, EntityAnimation.Walk, false);
        }
        else {
            changeAnimationOnEntity(player, EntityAnimation.Idle, false);
        }
    }
    else {
        if (player.velocity.y > 0) {
            if (jumpBehavior.jumping) {
                changeAnimationOnEntity(player, EntityAnimation.JumpFall, false);
            }
            else {
                changeAnimationOnEntity(player, EntityAnimation.Fall, false);
            }
            jumpBehavior.jumping = false;
        }
        else if (jumpBehavior.jumping) {
            changeAnimationOnEntity(player, EntityAnimation.Jump, false);
        }
    }

    // remove jump impulse if we hit the ceiling
    if (collisionType.hasCeilingCollision()) {
        removeImpulse(player, ImpulseType.Jump);
    }
}
