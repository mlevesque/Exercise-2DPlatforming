import { IEntity } from "../../model/entity.model";
import { IVector } from "../../model/geometry.model";
import { ICollisionSegment } from "../../model/collisions.model";
import { isFloor, isCeiling } from "./util";

export interface IResolver {
    addPotentialResolve(movementT: number, segmentT: number, collision: ICollisionSegment): void;
    shouldResolve(): boolean;
    performResolve(entity: IEntity, movementVector: IVector, resolveX: boolean, resolveY: boolean): void;
}

export class PointResolver implements IResolver {
    private _movementT: number;
    private _segmentT: number;
    private _collision: ICollisionSegment;

    private clearCollisions(): void {
        this._collision = null;
    }

    constructor() {
        this._movementT = 2;
        this._segmentT = 0;
        this._collision = null;
    }

    addPotentialResolve(movementT: number, segmentT: number, collision: ICollisionSegment): void {
        if (movementT < this._movementT) {
            this._movementT = movementT;
            this._segmentT = this._segmentT;
            this._collision = collision;
        }
    }

    shouldResolve(): boolean {
        return this._movementT <= 1;
    }

    performResolve(entity: IEntity, movementVector: IVector, resolveX: boolean, resolveY: boolean): void {
        if (resolveY) {
            entity.position.y = entity.prevPosition.y + this._movementT * movementVector.y;
            if ((isFloor(this._collision) && entity.velocity.y > 0)
                || (isCeiling(this._collision) && entity.velocity.y < 0)) {
                entity.velocity.y = 0;
            }
        }

        if (resolveX) {
            entity.position.x = entity.prevPosition.x + this._movementT * movementVector.x;
            entity.velocity.x = 0;
        }
    }
}
