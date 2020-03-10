import { IVector, subtract, scale, add } from "../utils/geometry";
import { IEntity } from "../redux/state";

/** Specifies which part of integration would an impulse affect. */
export enum ImpulseTarget {
    Acceleration = 0,
    Velocity = 1,
}

export interface IImpulse {
    impulse: IVector;
    timeRemaining: number;
    instant: boolean;
    target: ImpulseTarget;
}
export interface IImpulseMap {
    [type: string]: IImpulse;
}
export interface IMovementData {
    previousFrameTime: number;
    impulses: IImpulseMap;
    acceleration: IVector;
    velocity: IVector;
    previousFramePosition: IVector;
    previousIntegrationPosition: IVector;
    position: IVector;
}

/** Specifies the type of impulse catagory. */
export enum ImpulseType {
    Walk = "Walk",
    Jump = "Jump",
}

/**
 * Adds the given impulse data to the given movement data for an entity. Will overwrite a previous impulse of the same 
 * type.
 * @param entityMovement the movement data for an antity
 * @param type the type of impulse, such as a move or jump
 * @param impulse the impulse vector to apply during integration
 * @param duration amount of time to apply the impulse during integration, in milliseconds
 * @param instant if true, then the impulse only applies for one update
 * @param target specifies whether the impulse should be part of acceleration or velocity
 */
export function applyImpulseToEntity( entityMovement: IMovementData, 
                                      type: ImpulseType, 
                                      impulse: IVector, 
                                      duration: number, 
                                      instant: boolean,
                                      target: ImpulseTarget): void {

    // handle duration
    const entry = entityMovement.impulses[type];
    let timeRemaining = entry ? entry.timeRemaining + duration : duration;

    // if zero or less time remaining, then remove it
    if (entry && timeRemaining <= 0 && !instant) {
        removeImpulse(entityMovement, type);
    }

    // otherwise set impulse
    else {
        entityMovement.impulses[type] = {
            impulse: impulse, 
            instant: instant,
            timeRemaining: timeRemaining, 
            target: target
        };
    }
}

/**
 * Removes an impulse of the given type from the given movement data for an entity.
 * @param entityMovement 
 * @param type 
 */
export function removeImpulse(entityMovement: IMovementData, type: ImpulseType): void {
    const { [type]: _, ...impulses } = entityMovement.impulses;
    entityMovement.impulses = impulses;
}

export function setVelocity(movementData: IMovementData, velocity: IVector): void {
    movementData.velocity = scale(1 / movementData.previousFrameTime, velocity);
    movementData.previousIntegrationPosition = subtract(movementData.position, velocity);
}

export function shiftPosition(movementData: IMovementData, shiftVector: IVector): void {
    movementData.position = add(movementData.position, shiftVector);
    movementData.previousIntegrationPosition = add(movementData.previousIntegrationPosition, shiftVector);
}

export function setPosition(movementData: IMovementData, newPosition: IVector): void {
    shiftPosition(movementData, subtract(newPosition, movementData.position));
}
