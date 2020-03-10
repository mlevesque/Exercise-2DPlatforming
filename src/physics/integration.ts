import { IVector, add, scale, zeroVector, subtract } from "../utils/geometry";
import { IPositionData, IImpulse, IImpulseMap, shiftPosition } from "./movementData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPULSE HANDLING METHODS
type ImpulseEntry = [string, IImpulse];

function getImpulseEntriesFromEntityMovement(entityMovement: IPositionData): ImpulseEntry[] {
    return Object.entries(entityMovement.impulses);
}

function getPositionShiftEntriesFromEntityMovement(entityMovement: IPositionData): ImpulseEntry[] {
    return Object.entries(entityMovement.positionShifts);
}

function getSmallestTimeSliceFromImpulses(deltaT: number, impulseEntries: ImpulseEntry[]): number {
    let smallest = deltaT;
    impulseEntries.forEach((entry) => smallest = Math.min(smallest, entry[1].timeRemaining));
    return smallest;
}

function getAccumulatedImpulses(impulseEntries: ImpulseEntry[]): IVector {
    let result = zeroVector();
    impulseEntries.forEach((entry) => {result.x += entry[1].impulse.x; result.y += entry[1].impulse.y});
    return result;
}

function decrementTimeFromImpulses(deltaT: number, impulseEntries: ImpulseEntry[]): ImpulseEntry[] {
    return impulseEntries
        .map((entry) => {return <ImpulseEntry>[entry[0],{...entry[1], timeRemaining: entry[1].timeRemaining - deltaT}]})
        .filter((entry) => entry[1].timeRemaining > 0);
}

function convertImpulseEntriesToImpulseMap(impulseEntries: ImpulseEntry[]): IImpulseMap {
    let obj: IImpulseMap = {};
    impulseEntries.forEach((entry: ImpulseEntry) => obj[entry[0]] = entry[1]);
    return obj;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INTEGRATION METHODS
export interface IIntegrationMethod { (t: number, movementData: IPositionData, acceleration: IVector): void }

export function EulerIntegration( t: number, 
                                  movementData: IPositionData,
                                  acceleration: IVector): void {
    // integrate
    movementData.acceleration = acceleration;
    movementData.velocity = add(movementData.velocity, scale(t, movementData.acceleration));
    movementData.position = add(movementData.position, scale(t, movementData.velocity));
}

export function VerletIntegration( t: number, 
                                   movementData: IPositionData,
                                   acceleration: IVector): void {
    const timeModifier = t / movementData.previousTimeSlice;
    const pDiff = subtract(movementData.position, movementData.previousIntegrationPosition);
    const modPDiff = scale(timeModifier, pDiff);
    movementData.position = add(add(movementData.position, modPDiff), scale(t*t, acceleration));
    movementData.velocity = scale(1/t, pDiff);
    movementData.acceleration = acceleration;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INTEGRATION OF ENTITY
/**
 * Perform integration calculations on the given position data for an entity. This includes applying impulses and
 * position shifts.
 * @param deltaT 
 * @param positionData 
 * @param integrationMethod 
 * @param externalForces 
 */
export function integratePositionData( deltaT: number, 
                                       positionData: IPositionData, 
                                       integrationMethod: IIntegrationMethod, 
                                       externalForces: IVector) {
    const oldPosition = positionData.position;
    let impulseEntries = getImpulseEntriesFromEntityMovement(positionData);
    let positionShiftEntries = getPositionShiftEntriesFromEntityMovement(positionData);
    let remainingT = deltaT;

    // loop until we have used up all the frame time
    while (remainingT > 0) {
        // find the smallest time slice based on time remaining for impulses
        const accumulatedImpulses = getAccumulatedImpulses(impulseEntries);
        const accumulatedPositionShifts = getAccumulatedImpulses(positionShiftEntries);
        const timeSlice = Math.min(
            getSmallestTimeSliceFromImpulses(remainingT, impulseEntries),
            getSmallestTimeSliceFromImpulses(remainingT, positionShiftEntries)
        );
        impulseEntries = decrementTimeFromImpulses(timeSlice, impulseEntries);
        positionShiftEntries = decrementTimeFromImpulses(timeSlice, positionShiftEntries);

        // convert time slice to seconds
        const t = timeSlice / 1000;

        // integrate
        const oldIntegPos = positionData.position;
        integrationMethod(t, positionData, add(accumulatedImpulses, externalForces));
        positionData.previousIntegrationPosition = oldIntegPos;

        // position shift
        shiftPosition(positionData, scale(t, accumulatedPositionShifts));

        // store time slice
        positionData.previousTimeSlice = t;

        // update remaining time
        remainingT -= timeSlice;
    }

    // remove all instant impulses and set the updated impulse entries back to the movement data
    positionData.impulses = convertImpulseEntriesToImpulseMap(impulseEntries);
    positionData.positionShifts = convertImpulseEntriesToImpulseMap(positionShiftEntries);

    // store previous values for next time
    positionData.previousFramePosition = oldPosition;
}
