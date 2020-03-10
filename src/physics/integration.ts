import { IVector, add, scale, zeroVector, subtract, createVector } from "../utils/geometry";
import { IMovementData, ImpulseTarget, IImpulse, IImpulseMap, shiftPosition } from "./movementData";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMPULSES
type ImpulseEntry = [string, IImpulse];

function getImpulseEntriesFromEntityMovement(entityMovement: IMovementData): ImpulseEntry[] {
    return Object.entries(entityMovement.impulses);
}

function getSmallestTimeSliceFromImpulses(deltaT: number, impulseEntries: ImpulseEntry[]): number {
    let smallest = deltaT;
    impulseEntries.forEach((entry) => {
        const impulse = entry[1];
        if (!impulse.instant) {
            smallest = Math.min(smallest, impulse.timeRemaining);
        }
    });
    return smallest;
}

function getAccumulatedImpulsesByTimeSlice(deltaT: number, impulseEntries: ImpulseEntry[]): [IVector, IVector] {
    let velocity = zeroVector();
    let acceleration = zeroVector();
    impulseEntries.forEach((entry) => {
        const impulse = entry[1];
        switch (impulse.target) {
            case ImpulseTarget.Velocity:
                velocity = add(velocity, impulse.impulse);
                break;
            case ImpulseTarget.Acceleration:
                acceleration = add(acceleration, impulse.impulse);
                break;
        }
    });
    return [velocity, acceleration];
}

function decrementTimeFromImpulses(deltaT: number, impulseEntries: ImpulseEntry[]): ImpulseEntry[] {
    return impulseEntries
        .map((entry) => {return <ImpulseEntry>[entry[0],{...entry[1], timeRemaining: entry[1].timeRemaining - deltaT}]})
        .filter((entry) => entry[1].timeRemaining > 0 || entry[1].instant);
}

function removeAllInstantImpulses(impulseEntries: ImpulseEntry[]): ImpulseEntry[] {
    return impulseEntries.filter((entry) => !entry[1].instant);
}

function convertImpulseEntriesToImpulseMap(impulseEntries: ImpulseEntry[]): IImpulseMap {
    let obj: IImpulseMap = {};
    impulseEntries.forEach((entry: ImpulseEntry) => obj[entry[0]] = entry[1]);
    return obj;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INTEGRATION METHODS
export interface IIntegrationMethod { (t: number, movementData: IMovementData, acceleration: IVector): void }

export function EulerIntegration( t: number, 
                                  movementData: IMovementData,
                                  acceleration: IVector): void {
    // integrate
    movementData.acceleration = acceleration;
    movementData.velocity = add(movementData.velocity, scale(t, movementData.acceleration));
    movementData.position = add(movementData.position, scale(t, movementData.velocity));
}

export function VerletIntegration( t: number, 
                                   movementData: IMovementData,
                                   acceleration: IVector): void {
    const timeModifier = t / movementData.previousFrameTime;
    const pDiff = subtract(movementData.position, movementData.previousIntegrationPosition);
    const modPDiff = scale(timeModifier, pDiff);
    movementData.position = add(add(movementData.position, modPDiff), scale(t*t, acceleration));
    movementData.velocity = scale(1/t, pDiff);
    movementData.acceleration = acceleration;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INTEGRATION OF ENTITY
export function integrateEntity(deltaT: number, entityMovement: IMovementData, integrationMethod: IIntegrationMethod, externalForces: IVector) {
    const oldPosition = entityMovement.position;
    let impulseEntries = getImpulseEntriesFromEntityMovement(entityMovement);
    let remainingT = deltaT;

    // loop until we have used up all the frame time
    while (remainingT > 0) {
        // find the smallest time slice based on time remaining for impulses
        const timeSlice = getSmallestTimeSliceFromImpulses(remainingT, impulseEntries);
        const accumulatedImpulses = getAccumulatedImpulsesByTimeSlice(timeSlice, impulseEntries);
        impulseEntries = decrementTimeFromImpulses(timeSlice, impulseEntries);

        // convert time slice to seconds
        const t = timeSlice / 1000;

        // integrate
        const oldIntegPos = entityMovement.position;
        integrationMethod(t, entityMovement, add(accumulatedImpulses[1], externalForces));
        entityMovement.previousIntegrationPosition = oldIntegPos;

        // store time slice
        entityMovement.previousFrameTime = t;

        // update remaining time
        remainingT -= timeSlice;
    }

    // apply velocity impulse
    const a = getAccumulatedImpulsesByTimeSlice(deltaT, impulseEntries);
    shiftPosition(entityMovement, scale(deltaT / 1000, a[0]));

    // remove all instant impulses and set the updated impulse entries back to the movement data
    impulseEntries = removeAllInstantImpulses(impulseEntries);
    entityMovement.impulses = convertImpulseEntriesToImpulseMap(impulseEntries);

    // store previous values for next time
    entityMovement.previousFramePosition = oldPosition;
}
