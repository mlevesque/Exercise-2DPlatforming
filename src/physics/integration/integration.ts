import { IVector, add, scale, subtract } from "../../utils/geometry";
import { IPositionData } from "./MovementData";

export interface IIntegrationMethod { (t: number, movementData: IPositionData, acceleration: IVector): void }

export function EulerIntegration(t: number, movementData: IPositionData, acceleration: IVector): void {
    movementData.acceleration = acceleration;
    movementData.velocity = add(movementData.velocity, scale(t, movementData.acceleration));
    movementData.position = add(movementData.position, scale(t, movementData.velocity));
}

export function VerletIntegration(t: number, movementData: IPositionData, acceleration: IVector): void {
    const timeModifier = t / movementData.previousTimeSlice;
    const pDiff = subtract(movementData.position, movementData.previousIntegrationPosition);
    const modPDiff = scale(timeModifier, pDiff);
    movementData.position = add(add(movementData.position, modPDiff), scale(t*t, acceleration));
    movementData.velocity = scale(1/t, pDiff);
    movementData.acceleration = acceleration;
}
