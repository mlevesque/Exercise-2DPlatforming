import { ICollisionSegment } from "./CollisionSegment";
import { IRay, IVector, getEndOfRay, createRayPP, isZeroVector, createRayPV, add, createVector, negate,
    createShiftedRay } from "../utils/geometry";
import { CollisionType } from "./collisionType";
import { buildStartLedgeRay, buildEndLedgeRay } from "./util";

/**
 * Potential collision information to possibly be resolved.
 */
export interface ICollisionDetectionData {
    // t value along the movement ray where collision occurs. This should be between 0 and 1, inclusively
    movementT: number;
    // collision segment that had the collision
    collisionSegment: ICollisionSegment;
    // type of collision that occurred (floor, wall, ledge, etc)
    collisionType: CollisionType;
    // index of the resolve path if the movement used for collision came from the resolve path
    pathIndex: number;
}

/**
 * An entry in the resolve path array that contains the resolved movement and what kind of collision it was.
 */
export interface IResolvePathEntry {
    // resolved movement
    ray: IRay;
    // type of collision that occurred for this resolve (floor, wall, ledge, etc)
    type: CollisionType;
}

/**
 * The resulting final resolve position to set the entity to.
 */
export interface IResolvedPosition {
    // final calculated resolved entity position
    position: IVector;
    // final collision type (floor, wall, ledge, etc)
    collisionType: CollisionType;
}

/**
 * Keeps track of all collisions and how to resolve them for a specific entity on a single update frame.
 */
export class WorldCollisionTracker {
    // how much remaining entity movement we have left as we resolve to collisions
    private _remainingMovementRay: IRay;
    // updated entity movement based on collision resolves
    private _resolvePath: IResolvePathEntry[];
    // indicates if our collision resolve path has been completed and if the remaining movement has been depleted
    private _pathCompleted: boolean;
    // offset of the floor collision point from the position point of the entity
    private _floorCollisionOffset: IVector;
    // offset of the ceiling collision point from the position point of the entity
    private _ceilingCollisionOffset: IVector;
    // half width of collision bounding box for the entity. Used for calculating ledges and wall collision checking.
    private _entityHalfWidth: number;

    // Stored collision information of the best collision to resolve on during collision checks
    private _potentialCollision: ICollisionDetectionData;
    // mapping of all collision segments we have resolved to so that we don't check against them again
    private _resolvedSegments: Set<string>;


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // PRIVATE METHODS
    /**
     * Returns two movement rays offsetted to the corners of the entity in the direction of the given movement ray.
     * First ray is the bottom corner movement ray. Second ray is the top corner movement ray.
     * @param movement The ray that will be offsetted.
     */
    private getMovementWithWallOffsets(movement: IRay): [IRay, IRay] {
        const floorOffset = add(movement.p, this._floorCollisionOffset);
        const ceilingOffset = add(movement.p, this._ceilingCollisionOffset);
        const v = movement.v;
        const displace = v.x > 0 ? this._entityHalfWidth : -this._entityHalfWidth;
        return [
            createRayPV(floorOffset.x + displace, floorOffset.y, v.x, v.y),
            createRayPV(ceilingOffset.x + displace, ceilingOffset.y, v.x, v.y)
        ]
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // GETTERS
    get currentMovement(): IRay {return this._remainingMovementRay}
    get currentResolvePath(): IResolvePathEntry[] {return this._resolvePath}
    get pathCompleted(): boolean {return this._pathCompleted}
    get floorCollisionOffset(): IVector {return this._floorCollisionOffset}
    get ceilingCollisionOffset(): IVector {return this._ceilingCollisionOffset}
    get entityHalfWidth(): number {return this._entityHalfWidth}
    get currentCollisionDetectionData(): ICollisionDetectionData {return this._potentialCollision}


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // PUBLIC METHODS
    constructor(previousPosition: IVector, currentPosition: IVector, floorCollisionOffset: IVector, 
                ceilingCollisionOffset: IVector, entityHalfWidth: number) {
        this._remainingMovementRay = createRayPP( previousPosition.x, 
                                                  previousPosition.y, 
                                                  currentPosition.x, 
                                                  currentPosition.y);
        this._resolvePath = [];
        this._pathCompleted = false;
        this._floorCollisionOffset = floorCollisionOffset;
        this._ceilingCollisionOffset = ceilingCollisionOffset;
        this._entityHalfWidth = entityHalfWidth;
        this._resolvedSegments = new Set<string>();
        this.clearCurrentCollision();
    }

    /**
     * Adds the given collision id for a collision segment to a set of collisions we have already resolved to in order
     * to know not to collison check it again this update frame.
     * @param collisionId 
     */
    addSegmentToResolvedSet(collisionId: string): void {
        this._resolvedSegments.add(collisionId);
    }

    /**
     * Checks if the collision segment with the given id has already been resolved to.
     * @param collisionId 
     */
    hasSegmentAlreadyBeenResolved(collisionId: string): boolean {
        return this._resolvedSegments.has(collisionId);
    }

    /**
     * Clears out the current potential collision. This would be called when we have finished resolving it.
     */
    clearCurrentCollision(): void {
        this._potentialCollision = null;
    }

    /**
     * Stores a potential collision if it's movement t position value is smaller than the one already stored. We want to
     * keep track of the first collision to occur on the entity in the direction the entity is moving.
     * @param collisionData 
     */
    setPotentialCollision(collisionData: ICollisionDetectionData): void {
        if (!this._potentialCollision || collisionData.movementT < this._potentialCollision.movementT) {
            this._potentialCollision = collisionData;
        }
    }

    /**
     * Returns the remaining movement ray offsetted to the floor collision point of the entity. Returns null if there is
     * no remaining movement ray.
     */
    getRemainingMovementWithFloorOffset(): IRay {
        if (this._remainingMovementRay) {
            return createShiftedRay(this._remainingMovementRay, this._floorCollisionOffset);
        }
        return null;
    }

    /**
     * Returns the remaining movement ray offsetted to the ceiling collision point of the entity. Returns null if there
     * is no remaining movement ray.
     */
    getRemainingMovementWithCeilingOffset(): IRay {
        if (this._remainingMovementRay) {
            return createShiftedRay(this._remainingMovementRay, this._ceilingCollisionOffset);
        }
        return null;
    }

    /**
     * Returns two remaining movement rays offsetted to the bottom and top corners of the entity. If the movement ray is
     * moving towards the right, the rays will be offsetted horizontally on the right side of the entity. If the
     * movement ray is moving towards the left, the rays will be offsetted to the left side of the entity. Both returned
     * rays will be null if there is no remaining movement ray.
     */
    getRemainingMovementWithWallOffsets(): [IRay, IRay] {
        if (this._remainingMovementRay) {
            return this.getMovementWithWallOffsets(this._remainingMovementRay);
        }
        return [null, null];
    }

    /**
     * Returns a path ray from the resolve path at the given index and will be offsetted to the floor collision point
     * of the entity. Returns null if the index is invalid.
     * @param index index of the path entry in the resolve path.
     */
    getPathAtIndexWithFloorOffset(index: number): IResolvePathEntry {
        const entry = this.getPathEntryAtIndex(index);
        if (entry) {
            return {
                ray: createShiftedRay(entry.ray, this._floorCollisionOffset),
                type: entry.type
            }
        }
        return null;
    }

    /**
     * Returns a path ray from the resolve path at the given index and will be offsetted to the ceiling collision point
     * of the entity. Returns null if the index is invalid.
     * @param index index of the path entry in the resolve path.
     */
    getPathAtIndexWithCeilingOffset(index: number): IResolvePathEntry {
        const entry = this.getPathEntryAtIndex(index);
        if (entry) {
            return {ray: createShiftedRay(entry.ray, this._ceilingCollisionOffset), type: entry.type};
        }
        return null;
    }

    /**
     * Returns two path rays from the resolve path at the given index and will be offsetted to the top and bottom
     * corners of the entity. If the path is moving right, the rays will be offsetted to the right side of the entity.
     * If the path us moving left, the rays will be offsetted to the left side of the entity. First ray will be the
     * bottom corner. Second ray will be the top corner. Both returned rays will be null if the index is invalid.
     * @param index index of the path entry in the resolve path.
     */
    getPathAtIndexWithWallOffset(index: number): [IResolvePathEntry, IResolvePathEntry] {
        const entry = this.getPathEntryAtIndex(index);
        if (entry) {
            const rays = this.getMovementWithWallOffsets(entry.ray);
            return [
                {ray: rays[0], type: entry.type},
                {ray: rays[1], type: entry.type}
            ]
        }
        return [null, null];
    }

    /**
     * Returns a ray of the given collision segment offsetted based on the given collision type.
     * The ray will be such that if:
     *  - Collision Type is a ledge
     *      Will return a ledge ray instead of the ray of the segment itself.
     *  - Collision Type is a floor
     *      Will offset the ray by the floor collision offset.
     *  - Collision Type is a ceiling
     *      Will offset the ray by the ceiling collision offset.
     *  - Collision Type is a wall
     *      Will offset the ray to the left or right side of the entity based on what kind of wall.
     * This is called durring collision resolve to adjust the collision segment that we are resolving to so that our
     * resolve will be to the actually coordinate location of the entity.
     * @param collisionSegmentRay 
     * @param collisionType 
     */
    getCollisionSegmentWithOffset(collisionSegmentRay: IRay, collisionType: CollisionType): IRay {
        // get segment ray, or segment ledge ray if type is a ledge type
        let ray = collisionSegmentRay;
        if (collisionType.hasStartLedgeCollision()) {
            ray = buildStartLedgeRay(ray, this._entityHalfWidth);
        }
        else if (collisionType.hasEndLedgeCollision()) {
            ray = buildEndLedgeRay(ray, this._entityHalfWidth);
        }

        // determine the offsetted ray based on collision type
        if (collisionType.hasFloorCollision()) {
            ray = createShiftedRay(ray, negate(this._floorCollisionOffset));
        }
        else if (collisionType.hasCeilingCollision()) {
            ray = createShiftedRay(ray, negate(this._ceilingCollisionOffset));
        }
        else if (collisionType.hasLeftWallCollision()) {
            ray = createShiftedRay(ray, createVector(this._entityHalfWidth, 0));
        }
        else if (collisionType.hasRightWallCollision()) {
            ray = createShiftedRay(ray, createVector(-this._entityHalfWidth, 0));
        }
        return ray;
    }

    /**
     * Returns true if the given index is within the range of the current resolve path array.
     * @param index 
     */
    isPathIndexValid(index: number): boolean {
        return index >= 0 && index < this._resolvePath.length;
    }

    /**
     * Returns the resolve entry from the resolve path at the given index. Returns null if the index is invalid.
     * @param index 
     */
    getPathEntryAtIndex(index: number): IResolvePathEntry {
        return this.isPathIndexValid(index) ? this._resolvePath[index] : null;
    }

    /**
     * Pushes the given entry into the resolve path and sets the remaining movement to the given updated one.
     * This would be called once a potential collision has been resolved and the resolve should be stored.
     * @param entry 
     * @param updatedRemainingMovement 
     */
    addToResolvePath(entry: IResolvePathEntry, updatedRemainingMovement: IRay): void {
        this._resolvePath.push(entry);
        this._remainingMovementRay = updatedRemainingMovement;
    }

    /**
     * Modifies the resolve path, removing paths after the given index and changing the resolve on the path at the
     * given index. This is called when resolving along the already complete resolve path. This does nothing if the
     * index is invalid.
     * @param pathIndex 
     * @param updatedRay 
     * @param updatedCollisionType 
     */
    setUpdatedEndPath(pathIndex: number, updatedRay: IRay, updatedCollisionType: CollisionType): void {
        // do nothing if index is invalid
        if (this.isPathIndexValid(pathIndex)) {
            // cut off any later entries to make this index the last entry
            this._resolvePath = this._resolvePath.slice(0, pathIndex);

            // add the new updated last entry
            this._resolvePath.push({ray: updatedRay, type: updatedCollisionType});
        }
    }

    /**
     * Marks the resolve path as completed. This will take the remaining movement and push it to the resolve path.
     */
    completePath(): void {
        if (!this._pathCompleted) {
            if (this._remainingMovementRay && !isZeroVector(this._remainingMovementRay.v)) {
                const entry = {
                    ray: this._remainingMovementRay,
                    type: new CollisionType()
                }
                this.addToResolvePath(entry, null);
            }
            this._pathCompleted = true;
        }
    }

    /**
     * Returns true if there is still some remaining movement to collision check and possibly resolve.
     */
    hasRemainingMovement(): boolean {
        return this._remainingMovementRay != null;
    }

    /**
     * Returns true if there is a potential collision to be resolved.
     */
    hasCollisionDetectionData(): boolean {
        return this._potentialCollision != null;
    }

    /**
     * Returns true if there is a resolve path with at least one entry.
     */
    hasResolvePath(): boolean {
        return this._resolvePath.length > 0;
    }

    /**
     * Returns a calculated position and the collision type at the end of the resolve path, or from the remaining
     * movement if there is no resolve path. This would be called after all world collisions and resolves have completed
     * in order to set the final position of the entity.
     */
    getFinalResolvePosition(): IResolvedPosition {
        // get position at the end of the resolve path if there is a resolve path
        if (this.hasResolvePath()) {
            const lastEntry = this._resolvePath[this._resolvePath.length - 1];
            return {
                position: getEndOfRay(lastEntry.ray),
                collisionType: lastEntry.type
            }
        }

        // if there is no resolve path then just get the end of the reamining movement
        // this usually happens if no collisions occur
        else {
            return {
                position: getEndOfRay(this._remainingMovementRay),
                collisionType: new CollisionType()
            }
        }
    }
}
