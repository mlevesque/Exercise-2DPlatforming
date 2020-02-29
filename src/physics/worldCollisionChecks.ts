import { IEntity } from "../redux/state";
import { IVector, IRay, createVector } from "../utils/geometry";
import { ICollisionSegment } from "./CollisionSegment";
import { ISurfaceTypeCheck, isFloor, isCeiling, calculateTCollisionValues, isMovingTowardSegment, areTValuePairsInRange,
    getStartLedgeCollisionType, getEndLedgeCollisionType, buildStartLedgeRay, buildEndLedgeRay,
    isMovingTowardSegmentLedge} from "./util";
import { getEntityJsonData } from "../utils/jsonSchemas";
import { WorldCollisionTracker, IResolvePathEntry } from "./WorldCollisionTracker";
import { CollisionType, CollisionFlag } from "./collisionType";
import { resolveWithExternalDirection, resolveByPath } from "./collisionResolve";

/**
 * Checks collision against the given collision segment and stores the collision to the tracker.
 * @param movementRay movement of the entity.
 * @param pathIndex index of the movement of the entity if it comes from the resolve path
 * @param collisionSegment collision segment to check against
 * @param collisionTracker collision tracker that stores all found collisions and currently resolve positions
 * @param collisionType the base type of collisions we are cehcking (floor, ceiling)
 */
function checkPointCollisionOnSegment( movementRay: IRay, 
                                       pathIndex: number, 
                                       collisionSegment: ICollisionSegment, 
                                       collisionTracker: WorldCollisionTracker, 
                                       collisionType: CollisionType ): void {
    // calculate the t values along the movement ray and collision segment.
    // If both t values are between 0 and 1, inclusively, then they are intersecting (they are colliding)
    let tValues: [number, number] = null;
    let hasCollision = false;
    let type = new CollisionType(collisionType.rawValue);
    if (isMovingTowardSegment(movementRay.v, collisionSegment)) {
        tValues = calculateTCollisionValues(movementRay, collisionSegment.segment);
        hasCollision = areTValuePairsInRange(tValues[0], tValues[1]);
    }

    // if no collision with segment, try collision checks with ledges if the segment has any
    if (!hasCollision && isMovingTowardSegmentLedge(movementRay.v, collisionSegment)) {
        if (collisionSegment.startLedge) {
            let ledge = buildStartLedgeRay(collisionSegment.segment, collisionTracker.entityHalfWidth);
            tValues = calculateTCollisionValues(movementRay, ledge);
            hasCollision = areTValuePairsInRange(tValues[0], tValues[1]);
            if (hasCollision) {
                type.addType(getStartLedgeCollisionType(collisionSegment));
            }
        }

        if (!hasCollision && collisionSegment.endLedge) {
            let ledge = buildEndLedgeRay(collisionSegment.segment, collisionTracker.entityHalfWidth);
            tValues = calculateTCollisionValues(movementRay, ledge);
            hasCollision = areTValuePairsInRange(tValues[0], tValues[1]);
            if (hasCollision) {
                type.addType(getEndLedgeCollisionType(collisionSegment));
            }
        }
    }

    // if we have a collision (t values are in range) then add as potential collision to our tracker
    if (hasCollision) {
        collisionTracker.setPotentialCollision({
            movementT: tValues[0],
            collisionSegment: collisionSegment,
            collisionType: type,
            pathIndex: pathIndex
        });
    }
}

/**
 * Perform collision checks against all given collisions and stores the earliest collision along the given entity
 * movement into the collision tracker.
 * @param movementRay 
 * @param pathIndex 
 * @param collisions 
 * @param collisionTracker 
 * @param collisionType 
 * @param typeCheck 
 */
function performPointCollisions( movementRay: IRay,
                                 pathIndex: number,
                                 collisions: Map<string, ICollisionSegment>, 
                                 collisionTracker: WorldCollisionTracker,
                                 collisionType: CollisionType,
                                 typeCheck: ISurfaceTypeCheck): void {
    collisions.forEach((collisionSegment) => {
        if (!collisionTracker.hasSegmentAlreadyBeenResolved(collisionSegment.id) && typeCheck(collisionSegment)) {
            checkPointCollisionOnSegment(movementRay, pathIndex, collisionSegment, collisionTracker, collisionType);
        }
    });
}

/**
 * Performs collision checks for an entity and constructs a path when it resolves collisions.
 * @param collisions 
 * @param collisionTracker 
 * @param collisionType
 * @param surfaceTypeCheck 
 * @param initialResolveDirection 
 */
function buildPointCollisionResolvePath( collisions: Map<string, ICollisionSegment>, 
                                         collisionTracker: WorldCollisionTracker, 
                                         collisionType: CollisionType,
                                         surfaceTypeCheck: ISurfaceTypeCheck, 
                                         initialResolveDirection: IVector): void {
    // this loops until it exhausts all the remaining movement of the entity with collisions.
    while (!collisionTracker.pathCompleted) {
        const movementRay = collisionTracker.getMovementWithOffset();
        performPointCollisions(movementRay, -1, collisions, collisionTracker, collisionType, surfaceTypeCheck);
        // when a collision occurs, we should resolve it to update the remaining movement ray
        if (collisionTracker.hasCollisionDetectionData()) {
            resolveWithExternalDirection(collisionTracker, initialResolveDirection);
        }
        // if no resolve is needed, then there were no more collisions, so the resolve path is complete.
        else {
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
function performPointCollisionPathResolve( collisions: Map<string, ICollisionSegment>,
                                           collisionTracker: WorldCollisionTracker, 
                                           collisionType: CollisionType,
                                           surfaceTypeCheck: ISurfaceTypeCheck): void {
    // we iterate through the parts of the resolve path, starting at the beginning of the entity movement path
    // We break from this once we have found a collision are a part of the path
    collisionTracker.currentResolvePath.some((path: IResolvePathEntry, index:number) => {
        const pathEntry = collisionTracker.getPathAtIndexWithOffset(index);
        performPointCollisions(pathEntry.ray, index, collisions, collisionTracker, collisionType, surfaceTypeCheck);
        const result = collisionTracker.hasCollisionDetectionData();
        if (result) {
            resolveByPath(collisionTracker);
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
export function updateWorldCollisionsOnEntity(entity: IEntity, staticCollisions: Map<string, ICollisionSegment>): void {
    const entityData = getEntityJsonData(entity.type);
    const entityCollison = entityData.collision;
    let collisionTracker = new WorldCollisionTracker(entity.prevPosition, entity.position, entityCollison.halfWidth);

    // floor collisions
    collisionTracker.collisionOffset = entityCollison.floorPoint;
    let resolveDirection = createVector(0, -1);
    let collisionType = new CollisionType(CollisionFlag.Floor);
    buildPointCollisionResolvePath(staticCollisions, collisionTracker, collisionType, isFloor, resolveDirection);

    // ceiling collisions
    collisionTracker.collisionOffset = entityCollison.ceilingPoint;
    collisionType = new CollisionType(CollisionFlag.Ceiling);
    if (collisionTracker.pathCompleted) {
        performPointCollisionPathResolve(staticCollisions, collisionTracker, collisionType, isCeiling);
    }
    else {
        resolveDirection = createVector(0, 1);
        buildPointCollisionResolvePath(staticCollisions, collisionTracker, collisionType, isCeiling, resolveDirection);
    }

    // update the entity with the collision resolve results
    if (collisionTracker.hasResolvePath()) {
        const resolveData = collisionTracker.getFinalResolvePosition();
        entity.position = resolveData.position;
        if (resolveData.collisionType.hasFloorCollison() || resolveData.collisionType.hasCeilingCollison()) {
            entity.velocity.y = 0;
        }
    }
}
