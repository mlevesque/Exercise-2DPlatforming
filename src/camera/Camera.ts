import { IMovementData, buildMovementData } from "../physics/integration/MovementData";
import { IVector, subtract, vectorLength, scale, cloneVector, IArea } from "../utils/geometry";
import { EulerIntegration } from "../physics/integration/integration";

/**
 * Camera for a scene.
 */
class Camera implements ICamera {
    private _config: ICameraConfig;
    private _movementData: IMovementData;

    /**
     * Calculates the acceleration used for scrolling to a target using spring physics.
     * @param targetPosition 
     */
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

    /**
     * Constrains the camera movement along certain axes depending on the lock flags in the config.
     */
    private constrainByLocks(): void {
        const pos: IVector = {
            x: this._config.lockX ? this._movementData.previousPosition.x : this._movementData.position.x,
            y: this._config.lockY ? this._movementData.previousPosition.y : this._movementData.position.y
        };
        this._movementData.setPosition(pos);
    }

    /**
     * Constrains the camera movement only to within the bounds the the given map area.
     * @param mapArea 
     */
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

    /**
     * Constructor.
     * @param position 
     * @param config 
     */
    public constructor(position: IVector, config: ICameraConfig) {
        this._config = config;
        this._movementData = buildMovementData(position);
    }

    /** Movement for the camera. */
    public get movementData(): IMovementData {return this._movementData}
    /** Configuration data for camera behavior. */
    public get config(): ICameraConfig {return this._config}
    
    /** Sets the camera config to the given config. */
    public setConfig(config: ICameraConfig): void {this._config = config}

    /**
     * Updates the camera scrolling.
     * @param deltaT 
     * @param targetPosition 
     * @param mapArea 
     */
    public update(deltaT: number, targetPosition: IVector, mapArea: IArea): void {
        const acceleration = this.calculateAcceleration(targetPosition);
        this._movementData.update(deltaT, EulerIntegration, acceleration);
        this.constrainByLocks();
        if (this._config.worldConstraints) {
            this.constrainToWorldEdges(mapArea);
        }
    }

    /**
     * Returns the view area of the camera in world space.
     */
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

/**
 * Interface of the camera configuration that dictates some camera behavior.
 */
export interface ICameraConfig {
    halfWidth: number;
    halfHeight: number;
    lockX: boolean;
    lockY: boolean;
    worldConstraints: boolean;
    radius: number;
    spring: number;
    dampen: number;
}

/**
 * Interface of a camera.
 */
export interface ICamera {
    readonly movementData: IMovementData;
    readonly config: ICameraConfig;
    setConfig(config: ICameraConfig): void;
    update(deltaT: number, targetPosition: IVector, mapArea: IArea): void;
    getViewArea(): IArea;
}

/**
 * Builds and returns a camera.
 * @param position 
 * @param cameraConfig 
 */
export function buildCamera(position: IVector, cameraConfig: ICameraConfig): ICamera {
    return new Camera(position, cameraConfig);
}
