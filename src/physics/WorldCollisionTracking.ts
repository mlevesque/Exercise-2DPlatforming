import { ICollisionSegment } from "./CollisionSegment";
import { IRay, IVector, getEndOfRay, createRayPP, getPositionAlongRay, 
    zeroVector, createShiftedRay, negate } from "../utils/geometry";
import { capT, getPointCollision, isFloor, isCeiling, calculateTCollisionValues } from "./util";

/**
 * Keeps track of collision and resolves for an entity.
 */
export class WorldCollisionTracker {
    private _remainingMovementRay: IRay;
    private _offset: IVector;
    private _resolvedCollisionSegments: Set<string>;
    private _resolvePath: IRay[];

    // stored best potential collision
    private _bestT: number;
    private _bestPathIndex: number;
    private _bestCollisionRay: IRay;
    private _bestCollisionId: string;

    // flags
    private _pathIsComplete: boolean;
    private _floorCollision: boolean;
    private _ceilingCollision: boolean;

    /**
     * Resets the data involving keeping track of the best collision. This is called after a resolve completes.
     */
    private resetBestCollisionTracking(): void {
        this._bestT = 2;
        this._bestPathIndex = -1;
        this._bestCollisionRay = null;
        this._bestCollisionId = "";
    }

    /**
     * Adds a ray built by the given start and end positions to the end of the resolve path.
     * @param start 
     * @param end 
     */
    private addToPath(start: IVector, end: IVector): void {
        this._resolvePath.push(createRayPP(start.x, start.y, end.x, end.y));
    }

    /**
     * Internal setting of potential collision.
     * @param t 
     * @param pathIndex 
     * @param collisionRay 
     * @param collisionId 
     * @param isFloor 
     */
    private setPotentialCollision( t: number, 
                                   pathIndex: number, 
                                   collisionRay: IRay, 
                                   collisionId: string, 
                                   isFloor: boolean): void {
        if (t < this._bestT) {
            this._bestT = t;
            this._bestPathIndex = pathIndex;
            this._bestCollisionRay = collisionRay;
            this._bestCollisionId = collisionId;
            this._floorCollision = this._floorCollision || isFloor;
            this._ceilingCollision = this._ceilingCollision || !isFloor;
        }
    }

    /**
     * Constructor. The start and end params refer to the movement ray for an entity, from previous position to
     * current position.
     * @param start 
     * @param end 
     */
    public constructor(start: IVector, end: IVector) {
        this._remainingMovementRay = createRayPP(start.x, start.y, end.x, end.y);
        this._offset = zeroVector();
        this._resolvedCollisionSegments = new Set<string>();
        this._resolvePath = [];
        this._pathIsComplete = false;
        this._floorCollision = false;
        this._ceilingCollision = false;
        this.resetBestCollisionTracking();
    }

    // GETTERS
    public get resolvePath(): IRay[] {return this._resolvePath}
    public get lastRay(): IRay {
        if (this.isPathComplete() && this.hasResolvePath()) {
            return this._resolvePath[this._resolvePath.length - 1];
        }
        else {
            return this._remainingMovementRay;
        }
    }
    public get potentialCollisionRay(): IRay {return this._bestCollisionRay}

    /**
     * Returns the remaining movement ray with the offset applied. This is the part of the entity's movement that hasn't
     * yet been resolved.
     */
    public getOffsetRemainingMovementRay(): IRay {return createShiftedRay(this._remainingMovementRay, this._offset)}
    /**
     * Returns a part of the resolve path at the given index and offsets it by the offset.
     * @param index 
     */
    public getOffsetResolvePathAtIndex(index: number): IRay {
        return createShiftedRay(this._resolvePath[index], this._offset)
    }

    /** Returns true if the resolve path contains at least one ray. */
    public hasResolvePath(): boolean {return this._resolvePath.length > 0}
    /** Returns true if the remaining movement ray has been completed and turned into a full resolve path. */
    public isPathComplete(): boolean {return this._pathIsComplete}
    /** Returns true if any kind of collision had occurred. */
    public hasCollisionOccurred(): boolean {return this._floorCollision || this._ceilingCollision}
    /** Returns true if a floor collision has occurred. */
    public hasFloorCollision(): boolean {return this._floorCollision}
    /** Returns true if a ceiling collision has occurred. */
    public hasCeilingCollision(): boolean {return this._ceilingCollision}

    /**
     * Returns true if the given id for a collision has already been resolved to. Used to prevent us from checking
     * against the same collision if there is still more left to resolve.
     * @param id 
     */
    public hasResolvedWithCollisionId(id: string): boolean {return this._resolvedCollisionSegments.has(id)}

    /**
     * Sets the offset to be used in collision resolves. This is the offset between the collison point of the entity
     * and the entity's main position.
     * @param pos 
     */
    public setPositionalOffset(pos: IVector): void {
        this._offset = pos;
    }

    /**
     * Sets the given collision if the given t value is smaller than the stored one. If it is, then this is
     * considered the earliest collision found so far.
     * @param t The t value where the collision along the remaining movement (or part of a resolve path) that the
     *      collision ocurred. If this value is smaller than the stored t value, then this collison is stored.
     * @param collision The ray of the collsion segment.
     * @param pathIndex Optional. For collisions whose resolves should be along the resolve path, this refers to the
     *      index of the part of the path that had collision.
     */
    public setPotentialSegmentCollision(t: number, collision: ICollisionSegment, pathIndex: number = -1): void {
        this.setPotentialCollision(t, pathIndex, collision.segment, collision.id, isFloor(collision));
    }

    /**
     * Sets the given collision for a ledge if the given t value is smaller than the stored one. If it is, then this is
     * considered the earliest collision found so far.
     * @param t The t value where the collision along the remaining movement (or part of a resolve path) that the
     *      collision ocurred. If this value is smaller than the stored t value, then this collison is stored.
     * @param ledgeRay The generated ray for the ledge collision.
     * @param isFloor Whether the ledge is a floor ledge or a ceiling ledge.
     * @param pathIndex Optional. For collisions whose resolves should be along the resolve path, this refers to the
     *      index of the part of the path that had collision.
     */
    public setPotentialLedgeCollision(t: number, ledgeRay: IRay, isFloor: boolean, pathIndex: number = -1): void {
        this.setPotentialCollision(t, pathIndex, ledgeRay, "", isFloor);
    }

    /**
     * Returns true if a potential collision has been stored but has not yet been resolved.
     */
    public shouldResolve(): boolean {
        return this._bestCollisionRay != null;
    }

    /**
     * Resolves the stored collision and resolves it into the direction of the given vector. The resolve gets added to
     * the resolve path. If the resolve point lies within the collision segment, then the resolve path is completed.
     * If the resolve point lies outside the collision segment, then a remainder movement ray is calculated and set to 
     * the remaining movement ray. Finally, the stored collision is added to the resolved collision set and is
     * cleared out of the potential collision storage.
     * @param resolveDirection The direction at which to resolve the collision. If this is parallel to the collision
     *      segment, then we resolve to the intersection point of the collision and the resolve path is completed.
     */
    public resolveWithExternalDirection(resolveDirection: IVector): void {
        // find the intersection between where the entity currently is, with the resolve direction, and the collision
        // segment
        const resolveRay: IRay = {p: getEndOfRay(this._remainingMovementRay), v: resolveDirection};
        const offsetSegment = createShiftedRay(this._bestCollisionRay, negate(this._offset));
        const t: number = calculateTCollisionValues(offsetSegment, resolveRay)[0];

        // our t resolve value for this resolve will be the collision between the collision segment and the resolve
        // direction. If the resolve direction is parallel to the segment, then we use the collision check intersection
        const resolveT = isFinite(t) ? t : this._bestT;

        // add to resolve path
        const pathEndT = capT(resolveT);
        const pathEnd = getPositionAlongRay(offsetSegment, pathEndT);
        this.addToPath(this._remainingMovementRay.p, pathEnd);

        // if there is remaining t value after adding to the path, build the new movement ray from the edge of the
        // collision segment to the resolve ray
        if (resolveT - pathEndT != 0) {
            let newRay = {
                p: getPositionAlongRay(offsetSegment, pathEndT), 
                v: this._remainingMovementRay.v
            };
            const newRayEnd = getPointCollision(newRay, resolveRay);
            this._remainingMovementRay = createRayPP(newRay.p.x, newRay.p.y, newRayEnd.x, newRayEnd.y);
            this._pathIsComplete = false;
        }
        else {
            this._pathIsComplete = true;
        }

        // store collision in our resolved collisions set so that we don't test against it again during collision
        // checks, then clear out our stored best collision checks
        this._resolvedCollisionSegments.add(this._bestCollisionId);
        this.resetBestCollisionTracking();
    }

    /**
     * Resolves the collision along the resolve path at the stored resolve path index. The ray at this part of the
     * path gets modified to end at the resolve point and any parts after this part are removed.
     */
    public resolveAtPath(): void {
        // index for path needs to be valid
        if (this._bestPathIndex < 0 || this._bestPathIndex >= this._resolvePath.length) {
            return;
        }

        // get rid of any entries after the best index
        const rayAtIndex = this._resolvePath[this._bestPathIndex];
        this._resolvePath = this._resolvePath.slice(0, this._bestPathIndex);

        // adjust ray at best index to end at position of best t
        const newEnd = getPositionAlongRay(rayAtIndex, this._bestT);
        this._resolvePath.push(createRayPP(rayAtIndex.p.x, rayAtIndex.p.y, newEnd.x, newEnd.y));

        // store collision in our resolved collisions set so that we don't test against it again during collision
        // checks, then clear out our stored best collision checks
        this._resolvedCollisionSegments.add(this._bestCollisionId);
        this.resetBestCollisionTracking();
    }

    /**
     * If the path is not already completed, this will take the remaining movement and adds it to the end of the path.
     */
    public completePath(): void {
        if (!this.isPathComplete()) {
            this.resolvePath.push(this._remainingMovementRay);
            this._pathIsComplete = true;
        }
    }

    /**
     * Calculates the end point of the resolve path and returns it.
     */
    public getResolvePosition(): IVector {
        return getEndOfRay(this.lastRay);
    }
}
