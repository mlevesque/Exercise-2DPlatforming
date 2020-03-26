import { IMovementData, buildMovementData } from "../physics/integration/MovementData";
import { IVector, subtract, vectorLength, scale, cloneVector, IArea } from "../utils/geometry";
import { EulerIntegration } from "../physics/integration/integration";

class Camera implements ICamera {
    private _config: ICameraConfig;
    private _movementData: IMovementData;

    private calculateAcceleration(targetPosition: IVector): IVector {
        // form vector from camera to target
        const v = subtract(targetPosition, this._movementData.position);
    
        // calculate force
        // if the magnitude is within the radius of the area, then don't apply spring force
        const magnitude = vectorLength(v);
        const springK = magnitude <= this._config.radius 
            ? 0 
            : this._config.spring * (magnitude - this._config.radius) / magnitude;
        const springForce = scale(springK, v);
        const dampenForce = scale(this._config.dampen, this._movementData.velocity);
        return subtract(springForce, dampenForce);
    }

    private constrainByLocks(): void {
        const pos: IVector = {
            x: this._config.lockX ? this._movementData.previousPosition.x : this._movementData.position.x,
            y: this._config.lockY ? this._movementData.previousPosition.y : this._movementData.position.y
        };
        this._movementData.setPosition(pos);
    }

    private constrainToWorldEdges(mapArea: IArea): void {
        const newPos = cloneVector(this._movementData.position);
        if (!this._config.lockX) {
            newPos.x = Math.max(newPos.x, this._config.halfWidth);
            newPos.x = Math.min(newPos.x, mapArea.maxX - this._config.halfWidth);
    
        }
        if (!this._config.lockY) {
            newPos.y = Math.max(newPos.y, this._config.halfHeight);
            newPos.y = Math.min(newPos.y, mapArea.maxY - this._config.halfHeight);
        }
        this.movementData.setPosition(newPos);
    }

    public constructor(position: IVector, config: ICameraConfig) {
        this._config = config;
        this._movementData = buildMovementData(position);
    }

    public get movementData(): IMovementData {return this._movementData}
    public get config(): ICameraConfig {return this._config}
    
    public setConfig(config: ICameraConfig): void {this._config = config}

    public update(deltaT: number, targetPosition: IVector, mapArea: IArea): void {
        const acceleration = this.calculateAcceleration(targetPosition);
        this._movementData.update(deltaT, EulerIntegration, acceleration);
        this.constrainByLocks();
        this.constrainToWorldEdges(mapArea);
    }

    public getViewArea(): IArea {
        const pos = this._movementData.position;
        return {
            minX: pos.x - this._config.halfWidth,
            minY: pos.y - this._config.halfHeight,
            maxX: pos.x + this._config.halfWidth,
            maxY: pos.y + this._config.halfHeight
        }
    }
}

export interface ICameraConfig {
    halfWidth: number;
    halfHeight: number;
    lockX: boolean;
    lockY: boolean;
    radius: number;
    spring: number;
    dampen: number;
}

export interface ICamera {
    readonly movementData: IMovementData;
    readonly config: ICameraConfig;
    setConfig(config: ICameraConfig): void;
    update(deltaT: number, targetPosition: IVector, mapArea: IArea): void;
    getViewArea(): IArea;
}

export function buildCamera(position: IVector, cameraConfig: ICameraConfig): ICamera {
    return new Camera(position, cameraConfig);
}
