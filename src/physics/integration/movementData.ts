import { IVector, zeroVector, cloneVector, add, subtract, scale } from "../../utils/geometry";
import { IIntegrationMethod } from "./integration";

/**
 * An impulse is either an acceleration applied for a specific amount of time, or a position shift applied for a
 * specific amount of time. These are used to direct the movement of entities aside from constant forces like gravity.
 */
interface IImpulse {
    // the impulse vector to apply
    impulse: IVector;
    // the amount of time left to apply the impulse, in milliseconds
    timeRemaining: number;
}

type ImpulseMap = Map<ImpulseType, IImpulse>;

class MovementData implements IMovementData {
    private _positionData: IPositionData;
    private _impulses: ImpulseMap;
    private _positionShifts: ImpulseMap;
    private _previousFramePosition: IVector;

    private applyImpulseToMap(map: ImpulseMap, type: ImpulseType, impulse: IVector, duration: number): void {
        map.set(type, {impulse: impulse, timeRemaining: duration});
    }
    private addImpulseDurationToMap(map: ImpulseMap, type: ImpulseType, duration: number): void {
        const impulse = this.getImpulseFromMap(map, type);
        if (impulse) impulse.timeRemaining += duration;
    }
    private getImpulseFromMap(map: ImpulseMap, type: ImpulseType): IImpulse {
        return map.get(type);
    }

    private getSmallestTimeSliceFromImpulses(deltaT: number, impulseMap: ImpulseMap): number {
        let smallest = deltaT;
        impulseMap.forEach((entry) => smallest = Math.min(smallest, entry.timeRemaining));
        return smallest;
    }

    private getAccumulatedImpulses(impulseMap: ImpulseMap): IVector {
        let result = zeroVector();
        impulseMap.forEach((entry) => {result.x += entry.impulse.x; result.y += entry.impulse.y});
        return result;
    }
    
    private decrementTimeFromImpulses(deltaT: number, impulseMap: ImpulseMap): void {
        const toRemove: ImpulseType[] = [];
        impulseMap.forEach((value: IImpulse, key: ImpulseType) => {
            value.timeRemaining -= deltaT;
            if (value.timeRemaining <= 0) {
                toRemove.push(key);
            }
        });
        toRemove.forEach((key: ImpulseType) => impulseMap.delete(key));
    }

    constructor(position: IVector) {
        this._positionData = {
            position: cloneVector(position),
            velocity: zeroVector(),
            acceleration: zeroVector(),
            previousTimeSlice: 1,
            previousIntegrationPosition: cloneVector(position),
        }
        this._previousFramePosition = cloneVector(position);
        this._impulses = new Map();
        this._positionShifts = new Map();
    }

    public get previousPosition(): IVector {return this._previousFramePosition}
    public get position(): IVector {return this._positionData.position}
    public get velocity(): IVector {return this._positionData.velocity}
    public get acceleration(): IVector {return this._positionData.acceleration}

    public setPosition(pos: IVector): void {
        this.shiftPosition(subtract(pos, this._positionData.position));
    }
    public shiftPosition(shiftVector: IVector): void {
        this._positionData.position = add(this._positionData.position, shiftVector);
        this._positionData.previousIntegrationPosition=add(this._positionData.previousIntegrationPosition, shiftVector);
    }
    public setVelocity(vel: IVector): void {
        this._positionData.velocity = cloneVector(vel);
        const diff = scale(this._positionData.previousTimeSlice, vel);
        this._positionData.previousIntegrationPosition = subtract(this._positionData.position, diff);
    }
    public setAcceleration(acc: IVector): void {
        this._positionData.acceleration = cloneVector(acc);
    }

    public applyImpulse(type: ImpulseType, impulse: IVector, duration: number): void {
        this.applyImpulseToMap(this._impulses, type, impulse, duration);
    }
    public addImpulseDuration(type: ImpulseType, durationToAdd: number): void{
        this.addImpulseDurationToMap(this._impulses, type, durationToAdd);
    }
    public removeImpulse(type: ImpulseType): void {
        this._impulses.delete(type);
    }

    public applyPositionShift(type: ImpulseType, shift: IVector, duration: number): void {
        this.applyImpulseToMap(this._positionShifts, type, shift, duration);
    }
    public addPositionShiftDuration(type: ImpulseType, durationToAdd: number): void {
        this.addImpulseDurationToMap(this._positionShifts, type, durationToAdd);
    }
    public removePositionShift(type: ImpulseType): void {
        this._positionShifts.delete(type);
    }

    public update(deltaT: number, integrationMethod: IIntegrationMethod, externalForces: IVector): void {
        const oldPosition = this._positionData.position;
        let remainingT = deltaT;

        // loop until we have used up all the frame time
        while (remainingT > 0) {
            // find the smallest time slice based on time remaining for impulses
            const accumulatedImpulses = this.getAccumulatedImpulses(this._impulses);
            const accumulatedPositionShifts = this.getAccumulatedImpulses(this._positionShifts);
            const timeSlice = Math.min(
                this.getSmallestTimeSliceFromImpulses(remainingT, this._impulses),
                this.getSmallestTimeSliceFromImpulses(remainingT, this._positionShifts)
            );
            this.decrementTimeFromImpulses(timeSlice, this._impulses);
            this.decrementTimeFromImpulses(timeSlice, this._positionShifts);

            // convert time slice to seconds
            const t = timeSlice / 1000;

            // integrate
            const oldIntegPos = this._positionData.position;
            integrationMethod(t, this._positionData, add(accumulatedImpulses, externalForces));
            this._positionData.previousIntegrationPosition = oldIntegPos;

            // position shift
            this.shiftPosition(scale(t, accumulatedPositionShifts));

            // store time slice
            this._positionData.previousTimeSlice = t;

            // update remaining time
            remainingT -= timeSlice;
        }

        // store previous values for next time
        this._previousFramePosition = oldPosition;
    }
}

/** Specifies the type of impulse category. */
export enum ImpulseType {
    Walk = "Walk",
    Jump = "Jump",
}

export interface IPositionData {
    position: IVector;
    velocity: IVector;
    acceleration: IVector;
    previousTimeSlice: number;
    previousIntegrationPosition: IVector;
}

export interface IMovementData {
    readonly previousPosition: IVector;
    readonly position: IVector;
    readonly velocity: IVector;
    readonly acceleration: IVector;

    setPosition(pos: IVector): void;
    shiftPosition(shiftVector: IVector): void;
    setVelocity(vel: IVector): void;
    setAcceleration(acc: IVector): void;

    applyImpulse(type: ImpulseType, impulse: IVector, duration: number): void;
    addImpulseDuration(type: ImpulseType, durationToAdd: number): void;
    removeImpulse(type: ImpulseType): void;

    applyPositionShift(type: ImpulseType, shift: IVector, duration: number): void;
    addPositionShiftDuration(type: ImpulseType, durationToAdd: number): void;
    removePositionShift(type: ImpulseType): void;

    update(deltaT: number, integrationMethod: IIntegrationMethod, externalForces: IVector): void;
}

export function buildMovementData(position: IVector): IMovementData {
    return new MovementData(position);
}
