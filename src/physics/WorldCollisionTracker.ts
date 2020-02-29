import { ICollisionSegment } from "./CollisionSegment";
import { IRay, IVector, getEndOfRay, createRayPP, zeroVector, subtract, isZeroVector, createRayPV, add } 
    from "../utils/geometry";
import { CollisionType } from "./collisionType";

/**
 * Potential collision information to possibly be resolved.
 */
export interface ICollisionDetectionData {
    // t value along the movement ray where collision occurs. This will be between 0 and 1, inclusively
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
    // offset of the collision point from the position point of the entity
    private _offset: IVector;
    // half width of collision bounding box for the entity. Used for calculating ledges and wall collision checking.
    private _entityHalfWidth: number;

    // Stored collision information of the best collision to resolve on during collision checks
    private _potentialCollision: ICollisionDetectionData;
    // mapping of all collision segments we have resolved to so that we don't check against them again
    private _resolvedSegments: Set<string>;

    // GETTERS
    get currentMovement(): IRay {return this._remainingMovementRay}
    get currentResolvePath(): IResolvePathEntry[] {return this._resolvePath}
    get pathCompleted(): boolean {return this._pathCompleted}
    get collisionOffset(): IVector {return this._offset}
    get entityHalfWidth(): number {return this._entityHalfWidth}
    get currentCollisionDetectionData(): ICollisionDetectionData {return this._potentialCollision}

    // SETTERS
    set collisionOffset(offset: IVector) {this._offset = offset}

    /**
     * Constructor.
     * @param previousPosition Where entity was last frame.
     * @param currentPosition Where entity is this frame.
     * @param entityHalfWidth Half width of the entities collision bounding box.
     */
    constructor(previousPosition: IVector, currentPosition: IVector, entityHalfWidth: number) {
        this._remainingMovementRay = createRayPP( previousPosition.x, 
                                                  previousPosition.y, 
                                                  currentPosition.x, 
                                                  currentPosition.y);
        this._resolvePath = [];
        this._pathCompleted = false;
        this._offset = zeroVector();
        this._entityHalfWidth = entityHalfWidth;
        this.clearCurrentCollision();
        this._resolvedSegments = new Set<string>();
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
     * Returns the current remaining movement vector shifted by the point collision offset currently set for the entity.
     */
    getMovementWithOffset(): IRay {
        if (this._remainingMovementRay) {
            const offset = add(this._remainingMovementRay.p, this._offset);
            const v = this._remainingMovementRay.v;
            return createRayPV(offset.x, offset.y, v.x, v.y);
        }
        else {
            return null;
        }
    }

    /**
     * Returns a path ray from the current resolve path at the given index. The ray is shifted by the point collision
     * offset currently set for the entity. Returns null if the index is invalid.
     * @param index 
     */
    getPathAtIndexWithOffset(index: number): IResolvePathEntry {
        const entry = this.getPathEntryAtIndex(index);
        if (entry) {
            const offset = add(entry.ray.p, this._offset);
            return {
                ray: createRayPV(offset.x, offset.y, entry.ray.v.x, entry.ray.v.y),
                type: new CollisionType(entry.type.rawValue)
            }
        }
        else {
            return null;
        }
    }

    /**
     * Returns the current potential collision segment ray shifted by the point collision offset currently set for the
     * entity. Returns null if there is no potential collision.
     */
    getCollisionSegmentWithOffset(): IRay {
        if (this._potentialCollision && this._potentialCollision.collisionSegment) {
            const offset = subtract(this._potentialCollision.collisionSegment.segment.p, this._offset);
            const v = this._potentialCollision.collisionSegment.segment.v;
            return createRayPV(offset.x, offset.y, v.x, v.y);
        }
        else {
            return null;
        }
    }

    /**
     * Returns true if the given index is within the range of the current resolve path array.
     * @param index 
     */
    isPathIndexValid(index: number): boolean {
        return index >= 0 && index < this._resolvePath.length;
    }

    /**
     * Returns the resolve entry from the resolve path at the given index.
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
     * given index. This is called when resolving along the already complete resolve path. Typically this is used for
     * ceiling and wall collision resolves if entity has alraedy be resolved from floor collisions.
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
