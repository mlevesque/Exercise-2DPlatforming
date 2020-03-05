import { IEntity, EntityAnimation, EntityType } from "../redux/state";
import { createPlayerBehaviorData } from "./player";
import { add, IVector } from "../utils/geometry";

export enum MoveDirection {
    None = "None",
    Left = "Left",
    Right = "Right",
}

/**
 * Sets impulse to entity. Used for input or behavior controlled movement.
 * @param entity 
 * @param impulse 
 */
export function applyImpulseToEntity(entity: IEntity, impulse: IVector): void {
    entity.impulse = add(entity.impulse, impulse);
}

/**
 * Sets up an animation change for the given entity.
 * @param entity 
 * @param animationType 
 * @param reset If true, then if the entity is already during this given animation, it will reset it. If false, then
 *      the enity will not be affected if already on the same animation.
 */
export function changeAnimationOnEntity(entity: IEntity, animationType: EntityAnimation, reset: boolean = false): void {
    if (entity.currentAnimation != animationType || reset) {
        entity.currentAnimation = animationType;
        entity.elapsedTime = 0;
        entity.currentFrame = 0;
    }
}

/**
 * Returns a entity behavior data object for a given entity type.
 * @param entityType 
 */
export function createEntityBehaviorData(entityType: EntityType): any {
    switch (entityType) {
        case EntityType.Player:
            return createPlayerBehaviorData();
    }
}
