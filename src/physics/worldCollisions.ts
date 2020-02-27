import { IEntity } from "../redux/state";
import { IVector, IRay, createVector } from "../utils/geometry";
import { ICollisionSegment } from "./CollisionSegment";
import { ISegmentTypeCheck, isFloor, isCeiling, calculateTCollisionValues, isMovingTowardSegment, 
    isTValueInRange } from "./util";
import { getEntityJsonData } from "../utils/jsonSchemas";
import { WorldCollisionTracker } from "./WorldCollisionTracking";

/**
 * Performs point collision checks against the given collisions, and updates the given collision tracker with the
 * results.
 * @param movementRay 
 * @param movementIndex 
 * @param collisions 
 * @param collisionTracker 
 * @param typeCheck 
 */
export function performPointCollisions( movementRay: IRay,
                                        movementIndex: number,
                                        collisions: ICollisionSegment[], 
                                        collisionTracker: WorldCollisionTracker,
                                        typeCheck: ISegmentTypeCheck): void {
    collisions.forEach((collision) => {
        // in order for a collision segment to be considered, it needs to: 
        //  1) Be a collision we haven't resolved to for this entity on this update
        //  2) The corrent type of segment (floor or ceiling)
        //  3) The entity is moving in a directon towards the side of teh segment that has collision
        if (!collisionTracker.hasResolvedWithCollisionId(collision.id)
            && typeCheck(collision) 
            && isMovingTowardSegment(movementRay.v, collision)) {

            // calculate the t values along the movement ray and collision segment.
            // If both t values are between 0 and 1, inclusively, then they are intersecting (they are colliding)
            const tValues = calculateTCollisionValues(movementRay, collision.segment);
            if (isTValueInRange(tValues[0]) && isTValueInRange(tValues[1])) {
                // add collision to our tracker
                collisionTracker.setPotentialSegmentCollision(tValues[0], collision, movementIndex);
            }
        }
    });
}

/**
 * Performs collision checks for an entity and constructs a path when it resolves collisions.
 * @param collisions 
 * @param collisionTracker 
 * @param surfaceTypeCheck 
 * @param initialResolveDirection 
 */
export function buildPointCollisionResolvePath( collisions: ICollisionSegment[], 
                                                collisionTracker: WorldCollisionTracker, 
                                                surfaceTypeCheck: ISegmentTypeCheck, 
                                                initialResolveDirection: IVector): void {
    // this loops until it exhausts all the remaining movement of the entity with collisions.
    while (!collisionTracker.isPathComplete()) {
        const movementRay = collisionTracker.getOffsetRemainingMovementRay();
        performPointCollisions(movementRay, -1, collisions, collisionTracker, surfaceTypeCheck);
        // when a collision occurs, we should resolve it to update the remaining movement ray
        if (collisionTracker.shouldResolve()) {
            collisionTracker.resolveWithExternalDirection(initialResolveDirection);
        }
        else {
            // if no resolve is needed, then there were no more collisions, so the resolve path is complete.
            collisionTracker.completePath();
        }
    }
}

/**
 * Performs collision checks for an entity and resolves collisions using the resolve path already built in the
 * collision tracker.
 * @param collisions 
 * @param collisionTracker 
 * @param surfaceTypeCheck 
 */
export function performPointCollisionPathResolve( collisions: ICollisionSegment[],
                                                  collisionTracker: WorldCollisionTracker, 
                                                  surfaceTypeCheck: ISegmentTypeCheck): void {
    // we iterate through the parts of the resolve path, starting at the beginning of the entity movement path
    // We break from this once we have found a collision are a part of the path
    collisionTracker.resolvePath.some((path: IRay, index:number) => {
        const movementRay = collisionTracker.getOffsetResolvePathAtIndex(index);
        performPointCollisions(movementRay, index, collisions, collisionTracker, surfaceTypeCheck);
        const result = collisionTracker.shouldResolve();
        if (result) {
            collisionTracker.resolveAtPath();
        }
        // when result is true, it breaks us out of this loop
        return result;
    });
}

/**
 * Main world collision checking and resolving for a given entity.
 * @param entity 
 * @param staticCollisions 
 */
export function updateWorldCollisionsOnEntity(entity: IEntity, staticCollisions: ICollisionSegment[]): void {
    const entityData = getEntityJsonData(entity.type);
    let collisionTracker = new WorldCollisionTracker(entity.prevPosition, entity.position);

    // floor collisions
    collisionTracker.setPositionalOffset(entityData.collision.floorPoint);
    buildPointCollisionResolvePath(staticCollisions, collisionTracker, isFloor, createVector(0, -1));

    // ceiling collisions
    collisionTracker.setPositionalOffset(entityData.collision.ceilingPoint);
    if (collisionTracker.isPathComplete()) {
        performPointCollisionPathResolve(staticCollisions, collisionTracker, isCeiling);
    }
    else {
        buildPointCollisionResolvePath(staticCollisions, collisionTracker, isCeiling, createVector(0, 1));
    }

    // update the entity with the collision resolve results
    if (collisionTracker.hasCollisionOccurred()) {
        entity.position = collisionTracker.getResolvePosition();
        if (collisionTracker.hasFloorCollision() || collisionTracker.hasCeilingCollision()) {
            entity.velocity.y = 0;
        }
    }
}
