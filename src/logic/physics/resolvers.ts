import { IEntity } from "../../model/entity.model";
import { IVector } from "../../model/geometry.model";
import { ICollisionSegment } from "../../model/collisions.model";
import { isFloor } from "./util";

export interface IResolver {
    addPotentialResolve(movementT: number, segmentT: number, collision: ICollisionSegment): void;
    shouldResolve(): boolean;
    performResolve(entity: IEntity, movementVector: IVector): void;
}

export class PointResolver implements IResolver {
    private _movementT: number;
    private _segmentT: number;
    private _ceilingCollisions: ICollisionSegment;
    private _floorCollisions: ICollisionSegment;

    private setCollision(collision: ICollisionSegment): void {
        if (collision) {
            if (isFloor(collision)) {
                this._floorCollisions = collision;
            }
            else {
                this._ceilingCollisions = collision;
            }
        }
    }

    private clearCollisions(): void {
        this._ceilingCollisions = null;
        this._floorCollisions = null;
    }

    constructor() {
        this._movementT = 2;
        this._segmentT = 0;
        this._ceilingCollisions = null;
        this._floorCollisions = null;
    }

    addPotentialResolve(movementT: number, segmentT: number, collision: ICollisionSegment): void {
        // if we have a *better* t value, then clear out the collisions we were previously storing
        if (movementT < this._movementT) {
            this.clearCollisions();
        }

        // store resolve data if the movement t value is smaller than what we currently have
        if (movementT <= this._movementT) {
            this._movementT = movementT;
            this._segmentT = isFloor(collision) ? segmentT : this._segmentT;
            this.setCollision(collision);
        }
    }

    shouldResolve(): boolean {
        return this._movementT <= 1;
    }

    performResolve(entity: IEntity, movementVector: IVector): void {
        // set the y position for teh entity to the resolve point. x won't be touched here
        entity.position.y = entity.prevPosition.y + this._movementT * movementVector.y;

        // affect y velocity
        if ((this._ceilingCollisions && entity.velocity.y < 0)
            || (this._floorCollisions && entity.velocity.y > 0)) {
            entity.velocity.y = 0;
        }
    }
}
