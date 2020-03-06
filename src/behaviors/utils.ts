import { IEntity, EntityAnimation, EntityType } from "../redux/state";
import { createPlayerBehaviorData } from "./player";
import { IVector } from "../utils/geometry";

/** Specifies the type of horizontal entity movement. */
export enum MoveDirection {
    None = "None",
    Left = "Left",
    Right = "Right",
}

/** Specifies the type of impulse catagory. */
export enum ImpulseType {
    Walk = "Walk",
    Jump = "Jump",
}

/** Specifies which part of integration would an impulse affect. */
export enum ImpulseTarget {
    Acceleration = 0,
    Velocity = 1,
}

/**
 * Adds the given impulse data to the given entity. Will overwrite a previous impulse of the same type.
 * @param entity the entity to apply the impulse to
 * @param type the type of impulse, such as a move or jump
 * @param impulse the impulse vector to apply during integration
 * @param duration amount of time to apply the impulse during integration, in milliseconds
 * @param instant if true, then the impulse only applies for one update
 * @param target specifies whether the impulse should be part of acceleration or velocity
 */
export function applyImpulseToEntity( entity: IEntity, 
                                      type: ImpulseType, 
                                      impulse: IVector, 
                                      duration: number, 
                                      instant: boolean,
                                      target: ImpulseTarget): void {

    // handle duration
    const entry = entity.impulses[type];
    let timeRemaining = entry ? entry.timeRemaining + duration : duration;

    // if zero or less time remaining, then remove it
    if (entry && timeRemaining <= 0 && !instant) {
        removeImpulse(entity, type);
    }

    // otherwise set impulse
    else {
        entity.impulses[type] = {
            impulse: impulse, 
            instant: instant,
            timeRemaining: timeRemaining, 
            target: target
        };
    }
}

/**
 * Removes an impulse of the given type from the given entity.
 * @param entity 
 * @param type 
 */
export function removeImpulse(entity: IEntity, type: ImpulseType): void {
    const { [type]: _, ...impulses } = entity.impulses;
    entity.impulses = impulses;
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
