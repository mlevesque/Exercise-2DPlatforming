import { EntityEventHandleMap, updateEntityMove, updateEntityCollisionVelocity, handleWorldCollision } from "./common";
import { GameEventType, InputActionEvent, GameEvent } from "../events/GameEvents";
import { IEntity } from "../redux/state";
import { MoveDirection } from "./utils";
import { CollisionType } from "../physics/collisions/collisionType";
import { getEntityJsonData, IPlayerSchema, IJumpDuration, IJumpSchema } from "../utils/jsonSchemas";
import { createVector } from "../utils/geometry";
import { IBehaviorData, setBehaviorCollision, setBehaviorMovement, setBehaviorJump, getBehaviorMovement, 
    getBehaviorJump, getBehaviorCollision} from "./behaviorData";
import { applyImpulse, ImpulseType, removeImpulse, addImpulseDuration } from "../physics/integration/movementData";
import { EntityAnimation } from "../animation/SpriteAnimation";

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
        jumpKeyElapsedTime: 0,
        onGround: false,
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

    // we can only signal if the jump key is pressed if:
    //  1) We are currently jumping and haven't let go of the key since we started jumping
    //  2) We are not jumping
    const oldPress = jumpBehavior.jumpPressed;
    if ((jumpBehavior.jumping && oldPress) || !jumpBehavior.jumping) {
        jumpBehavior.jumpPressed = inputEvent.jump;
    }

    // if we are on the ground and jump is pressed down, signal that we will jump
    if (jumpBehavior.onGround && jumpBehavior.jumpPressed) {
        jumpBehavior.jumping = true;
        jumpBehavior.jumpKeyElapsedTime = 0;
        jumpBehavior.jumpDuration = 0;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ACTION UPDATE
function getJumpDuration(jumpDuration: number, jumpData: IJumpSchema): number {
    let entry: IJumpDuration = null;
    const entries = jumpData.additionalDurations;
    for (let i = entries.length - 1; i >= 0; --i) {
        if (jumpDuration >= entries[i].keyDuration) {
            entry = entries[i];
        }
    }
    if (entry) {
        return entry.impulseDuration;
    }
    return jumpData.initialDuration;
}

export function updatePlayerActionBehavior(deltaT: number, player: IEntity): void {
    // set left and right movement
    const entityData = getEntityJsonData(player.type) as IPlayerSchema;
    let moveBehavior = getBehaviorMovement(player.behavior);
    updateEntityMove(deltaT, player, moveBehavior.moveDirection, entityData.speed);

    // detach any segment if we are jumping
    let jumpBehavior = getBehaviorJump(player.behavior);
    let collisionBehavior = getBehaviorCollision(player.behavior);
    if (jumpBehavior.jumping) {
        collisionBehavior.segId = "";
    }

    // apply jump impulse if we are jumping and the jump key is still pressed
    if (jumpBehavior.jumping && jumpBehavior.jumpPressed) {
        const duration = getJumpDuration(jumpBehavior.jumpKeyElapsedTime, entityData.jump);

        // if we just started jumping, create the impulse
        if (jumpBehavior.jumpDuration == 0) {
            applyImpulse(
                player.positionData, 
                ImpulseType.Jump, 
                createVector(0, -entityData.jump.speed), 
                0
            );
        }
        
        // add to the duration if our new duration is larger
        if (duration > jumpBehavior.jumpDuration) {
            addImpulseDuration(
                player.positionData, 
                ImpulseType.Jump,
                duration - jumpBehavior.jumpDuration
            );
            jumpBehavior.jumpDuration = duration;
        }

        // accumulate key time
        jumpBehavior.jumpKeyElapsedTime += deltaT;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REACTION UPDATE
export function updatePlayerReactionBehavior(deltaT: number, player: IEntity): void {
    // update velocity upon collisions
    const collisionBehavior = getBehaviorCollision(player.behavior);
    const collisionType = new CollisionType(collisionBehavior.collisionType);
    updateEntityCollisionVelocity(player, collisionType);

    // handle move and jump animations
    let moveBehavior = getBehaviorMovement(player.behavior);
    if (collisionType.hasFloorCollision()) {
        switch (moveBehavior.moveDirection) {
            case MoveDirection.Left:
            case MoveDirection.Right:
                player.spriteAnimation.setAnimation(EntityAnimation.Walk, false);
                break;
            default:
                player.spriteAnimation.setAnimation(EntityAnimation.Idle, false);
                break;
        }
    }
    
    // handle jump flags
    let jumpBehavior = getBehaviorJump(player.behavior);
    if (collisionType.hasFloorCollision()) {
        jumpBehavior.onGround = true;
        jumpBehavior.jumping = false;
    }
    else {
        jumpBehavior.onGround = false;
    }

    // remove jump impulse if we hit the ceiling
    if (collisionType.hasCeilingCollision()) {
        removeImpulse(player.positionData, ImpulseType.Jump);
    }
    
    // handle jump animation
    if (player.positionData.velocity.y < 0 && jumpBehavior.jumping) {
        player.spriteAnimation.setAnimation(EntityAnimation.Jump, false);
    }

    // handle fall animation
    if (!collisionType.hasFloorCollision() && player.positionData.velocity.y > 0) {
        if (jumpBehavior.jumping) player.spriteAnimation.setAnimation(EntityAnimation.JumpFall, false);
        else player.spriteAnimation.setAnimation(EntityAnimation.Fall, false);
    }
}
