import { ICollisionBehaviorData, EntityEventHandleMap, updateEntityMove, updateEntityCollisionVelocity, 
    IMovementBehaviorData, handleWorldCollision, handleInputAction } from "./common";
import { GameEventType } from "../events/GameEvents";
import { IEntity, EntityAnimation } from "../redux/state";
import { changeAnimationOnEntity, MoveDirection } from "./utils";
import { CollisionFlag, CollisionType } from "../physics/collisionType";
import { getEntityJsonData } from "../utils/jsonSchemas";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BEHAVIOR DATA
export interface IPlayerBehavior extends ICollisionBehaviorData, IMovementBehaviorData {}

export function createPlayerBehaviorData(): IPlayerBehavior {
    return {
        moveDirection: MoveDirection.None,
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
    const entityData = getEntityJsonData(player.type);
    updateEntityMove(player, behavior.moveDirection, entityData.speed);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// REACTION UPDATE
export function updatePlayerReactionBehavior(deltaT: number, player: IEntity): void {
    const behavior = player.behavior as IPlayerBehavior;
    const collisionType = new CollisionType(behavior.collisionType);

    updateEntityCollisionVelocity(player, collisionType);

    if (collisionType.hasFloorCollision()) {
        if (behavior.moveDirection == MoveDirection.Left || behavior.moveDirection == MoveDirection.Right) {
            changeAnimationOnEntity(player, EntityAnimation.Walk, false);
        }
        else {
            changeAnimationOnEntity(player, EntityAnimation.Idle, false);
        }
    }
    else if (player.velocity.y > 100) {
        changeAnimationOnEntity(player, EntityAnimation.Fall, false);
    }
}
