import { IHandleGameEvent, IBehaviorComponentMap } from "../IBehavior";
import { IBehaviorComponent, BehaviorMovementComponent, BehaviorJumpComponent, MoveDirection } 
    from "../BehaviorComponents";
import { GameEventType, InputActionEvent } from "../../events/GameEvents";
import { IJumpSchema, IJumpDuration, getEntityJsonData, IPlayerSchema } from "../../utils/jsonSchemas";
import { updateEntityMove, updateEntityCollisionVelocity } from "../commonBehaviorActions";
import { ImpulseType } from "../../physics/integration/MovementData";
import { createVector } from "../../utils/geometry";
import { EntityAnimation } from "../../animation/SpriteAnimation";
import { BaseBehavior } from "./BaseBehavior";
import { IEntity } from "../../entities/IEntity";

/**
 * Behavior for a player entity.
 */
class PlayerBehavor extends BaseBehavior {
    /**
     * Populate components.
     */
    protected buildBehaviorComponents(): IBehaviorComponent[] {
        return [
            new BehaviorMovementComponent(),
            new BehaviorJumpComponent()
        ];
    }

    /**
     * Setup event handlers.
     */
    protected buildEventHandlerLinks(): [GameEventType, IHandleGameEvent][] {
        return [
            [GameEventType.InputAction, this.handleInputAction],
        ]
    }

    /**
     * Event handler for player input.
     * @param event 
     * @param behaviorComMap 
     */
    private handleInputAction(event: InputActionEvent, behaviorComMap: IBehaviorComponentMap): void {
        const moveBehavior = behaviorComMap.getComponent(BehaviorMovementComponent);
        const jumpBehavior = behaviorComMap.getComponent(BehaviorJumpComponent);

        // handle move
        moveBehavior.moveDirection = event.direction;

        // we can only signal if the jump key is pressed if:
        //  1) We are currently jumping and haven't let go of the key since we started jumping
        //  2) We are not jumping
        const oldPress = jumpBehavior.jumpPressed;
        if ((jumpBehavior.jumping && oldPress) || !jumpBehavior.jumping) {
            jumpBehavior.jumpPressed = event.jump;
        }

        // if we are on the ground and jump is pressed down, signal that we will jump
        if (jumpBehavior.onGround && jumpBehavior.jumpPressed) {
            jumpBehavior.jumping = true;
            jumpBehavior.jumpKeyElapsedTime = 0;
            jumpBehavior.jumpDuration = 0;
        }
    }

    /**
     * Returns the next jump duration to use based on key duration.
     * @param jumpDuration 
     * @param jumpData 
     */
    private getJumpDuration(jumpDuration: number, jumpData: IJumpSchema): number {
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

    /**
     * Handle player behavior actions after input.
     * @param deltaT 
     * @param entity 
     */
    public handleBehaviorAction(deltaT: number, entity: IEntity): void {
        // set left and right movement
        const entityData = getEntityJsonData(entity.type) as IPlayerSchema;
        const moveBehavior = this.componentMap.getComponent(BehaviorMovementComponent);
        updateEntityMove(deltaT, entity, moveBehavior.moveDirection, entityData.speed);

        // detach any segment if we are jumping
        const jumpBehavior = this.componentMap.getComponent(BehaviorJumpComponent);
        if (jumpBehavior.jumping) {
            entity.collisions.clearAttachedSegment();
        }

        // apply jump impulse if we are jumping and the jump key is still pressed
        if (jumpBehavior.jumping && jumpBehavior.jumpPressed) {
            const duration = this.getJumpDuration(jumpBehavior.jumpKeyElapsedTime, entityData.jump);

            // if we just started jumping, create the impulse
            if (jumpBehavior.jumpDuration == 0) {
                entity.movement.applyImpulse(
                    ImpulseType.Jump, 
                    createVector(0, -entityData.jump.speed), 
                    0
                );
            }
            
            // add to the duration if our new duration is larger
            if (duration > jumpBehavior.jumpDuration) {
                entity.movement.addImpulseDuration(
                    ImpulseType.Jump,
                    duration - jumpBehavior.jumpDuration
                );
                jumpBehavior.jumpDuration = duration;
            }

            // accumulate key time
            jumpBehavior.jumpKeyElapsedTime += deltaT;
        }
    }

    /**
     * Handles player behavior reactions after collisions.
     * @param deltaT 
     * @param entity 
     */
    public handleBehaviorReaction(deltaT: number, entity: IEntity): void {
        // update velocity upon collisions
        updateEntityCollisionVelocity(entity);

        // handle move and jump animations
        const moveBehavior = this.componentMap.getComponent(BehaviorMovementComponent);
        const collisionType = entity.collisions.currentCollisions;
        if (collisionType.hasFloorCollision()) {
            switch (moveBehavior.moveDirection) {
                case MoveDirection.Left:
                case MoveDirection.Right:
                    entity.spriteAnimation.setAnimation(EntityAnimation.Walk, false);
                    break;
                default:
                    entity.spriteAnimation.setAnimation(EntityAnimation.Idle, false);
                    break;
            }
        }
        
        // handle jump flags
        const jumpBehavior = this.componentMap.getComponent(BehaviorJumpComponent);
        if (collisionType.hasFloorCollision()) {
            jumpBehavior.onGround = true;
            jumpBehavior.jumping = false;
        }
        else {
            jumpBehavior.onGround = false;
        }

        // remove jump impulse if we hit the ceiling
        if (collisionType.hasCeilingCollision()) {
            entity.movement.removeImpulse(ImpulseType.Jump);
        }
        
        // handle jump animation
        if (entity.movement.velocity.y < 0 && jumpBehavior.jumping) {
            entity.spriteAnimation.setAnimation(EntityAnimation.Jump, false);
        }

        // handle fall animation
        if (!collisionType.hasFloorCollision() && entity.movement.velocity.y > 0) {
            if (jumpBehavior.jumping) entity.spriteAnimation.setAnimation(EntityAnimation.JumpFall, false);
            else entity.spriteAnimation.setAnimation(EntityAnimation.Fall, false);
        }
    }
}

/**
 * Creates a new player behavior instance and returns it.
 */
export function buildPlayerBehavior(): PlayerBehavor {return new PlayerBehavor()}
