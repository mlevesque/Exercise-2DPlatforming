import { IEntity, EntityAnimation, EntityType } from "../redux/state";
import { createPlayerBehaviorData } from "./player";
import { IVector } from "../utils/geometry";

/** Specifies the type of horizontal entity movement. */
export enum MoveDirection {
    None = "None",
    Left = "Left",
    Right = "Right",
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
