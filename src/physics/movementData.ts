import { IVector, subtract, scale, add } from "../utils/geometry";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPULSE MODEL
/**
 * An impulse is either an acceleration applied for a specific amount of time, or a position shift applied for a
 * specific amount of time. These are used to direct the movement of entities aside from constant forces like gravity.
 */
export interface IImpulse {
    // the impulse vector to apply
    impulse: IVector;
    // the amount of time left to apply the impulse, in milliseconds
    timeRemaining: number;
}

/**
 * Defines a key mapping of different impulses. We keep impulses separate so that we can add and remove specific ones
 * at will.
 */
export interface IImpulseMap {
    [type: string]: IImpulse;
}

/**
 * This contains all data pertaining to positioning and movement of an entity.
 */
export interface IPositionData {
    // stores the time slice of the previous integration calculation, in milliseconds
    previousTimeSlice: number;

    // impulse forces to be applied to the entity. Used for jumping
    impulses: IImpulseMap;
    // position shifting impulses to be applied to the entity. Used for moving left and right
    positionShifts: IImpulseMap;

    // current constant acceleration, such as gravity, in pixels per squared seconds
    acceleration: IVector;
    // current velocity of the entity, in pixels per seconds
    velocity: IVector;
    // current position of the entity, in world pixels space
    position: IVector;

    // NOTE: We have two previous positions because:
    //  1) One is used to denote where the entity was in the last frame. This is used during collision detection.
    //  2) The second is used to denote where the entity was after the last integration calculation. There may be more
    //      than one integration calculation per frame since we would need to cut up the frame time by slices due to
    //      impulses needing to be applied for a specific amount of time. This is used in integration calculations.
    previousFramePosition: IVector;
    previousIntegrationPosition: IVector;
}

/** Specifies the type of impulse category. */
export enum ImpulseType {
    Walk = "Walk",
    Jump = "Jump",
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPULSE METHODS
function applyImpulseToMap(map: IImpulseMap, type: ImpulseType, impulse: IVector, duration: number): void {
    map[type] = {impulse: impulse, timeRemaining: duration};
}
function addImpulseDurationToMap(map: IImpulseMap, type: ImpulseType, duration: number): void {
    const impulse = getImpulseFromMap(map, type);
    if (impulse) impulse.timeRemaining += duration;
}
function getImpulseFromMap(map: IImpulseMap, type: ImpulseType): IImpulse {
    return map[type];
}

export function applyImpulse(positionData: IPositionData, type: ImpulseType, impulse: IVector, duration: number): void {
    applyImpulseToMap(positionData.impulses, type, impulse, duration);
}
export function addImpulseDuration(positionData: IPositionData, type: ImpulseType, durationToAdd: number): void {
    addImpulseDurationToMap(positionData.impulses, type, durationToAdd);
}
export function removeImpulse(positionData: IPositionData, type: ImpulseType): void {
    const { [type]: _, ...impulses } = positionData.impulses;
    positionData.impulses = impulses;
}
export function applyPositionShift( positionData: IPositionData, 
                                    type: ImpulseType, 
                                    impulse: IVector, 
                                    duration: number): void {
    applyImpulseToMap(positionData.positionShifts, type, impulse, duration);
}
export function addPositionShiftDuration(positionData: IPositionData, type: ImpulseType, durationToAdd: number): void {
    addImpulseDurationToMap(positionData.positionShifts, type, durationToAdd);
}
export function removePositionShift(positionData: IPositionData, type: ImpulseType): void {
    const { [type]: _, ...positionShifts } = positionData.positionShifts;
    positionData.positionShifts = positionShifts;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// POSITIONING ACCESS METHODS
export function setVelocity(movementData: IPositionData, velocity: IVector): void {
    movementData.velocity = scale(1 / movementData.previousTimeSlice, velocity);
    movementData.previousIntegrationPosition = subtract(movementData.position, velocity);
}
export function setPosition(movementData: IPositionData, newPosition: IVector): void {
    shiftPosition(movementData, subtract(newPosition, movementData.position));
}
export function shiftPosition(movementData: IPositionData, shiftVector: IVector): void {
    movementData.position = add(movementData.position, shiftVector);
    movementData.previousIntegrationPosition = add(movementData.previousIntegrationPosition, shiftVector);
}
