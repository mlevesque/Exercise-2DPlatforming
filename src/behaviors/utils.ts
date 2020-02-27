import { IEntity, EntityAnimation } from "../redux/state";

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
