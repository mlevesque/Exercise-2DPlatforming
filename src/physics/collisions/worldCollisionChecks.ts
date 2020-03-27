import { IPhysicsConfig } from "../../redux/state";
import { IVector, IRay, createVector } from "../../utils/geometry";
import { ICollisionSegment } from "./CollisionSegment";
import { ISurfaceTypeCheck, isFloor, isCeiling, calculateTCollisionValues, isMovingTowardSegment, areTValuePairsInRange,
    getStartLedgeCollisionType, getEndLedgeCollisionType, buildStartLedgeRay, buildEndLedgeRay,
    isMovingTowardSegmentLedge, isTValueInRange, areTValuesOnOppositeOutsideRange, isWall, 
    getCollisionTypeForAttachedSegment, areTValuesPairsInRangeForLedge} from "../util";
import { getEntityJsonData } from "../../utils/jsonSchemas";
import { WorldCollisionTracker, IResolvePathEntry } from "./WorldCollisionTracker";
import { CollisionType, CollisionFlag } from "./collisionType";
import { resolveWithExternalDirection, resolveByPath } from "./collisionResolve";
import { GameEventQueue } from "../../events/GameEventQueue";
import { WorldCollisionEvent } from "../../events/GameEvents";
import { BehaviorCollisionComponent } from "../../behaviors/BehaviorComponents";
import { IEntity } from "../../entities/IEntity";

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
            hasCollision = areTValuesPairsInRangeForLedge(tValues[0], tValues[1]);
            if (hasCollision) {
                type.addType(getStartLedgeCollisionType(collisionSegment));
            }
        }

        if (!hasCollision && collisionSegment.endLedge) {
            let ledge = buildEndLedgeRay(collisionSegment.segment, collisionTracker.entityHalfWidth);
            tValues = calculateTCollisionValues(movementRay, ledge);
            hasCollision = areTValuesPairsInRangeForLedge(tValues[0], tValues[1]);
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
 * Performs collision detection for given wall segment.
 * @param topMovementRay 
 * @param bottomMovementRay 
 * @param pathIndex 
 * @param collisionSegment 
 * @param collisionTracker 
 * @param collisionType 
 */
function checkWallCollisionOnSegment( topMovementRay: IRay,
                                      bottomMovementRay: IRay,
                                      pathIndex: number,
                                      collisionSegment: ICollisionSegment,
                                      collisionTracker: WorldCollisionTracker,
                                      collisionType: CollisionType): void {
    let moveT: number;
    let hasCollision: boolean = false;
    if (isMovingTowardSegment(topMovementRay.v, collisionSegment)) {
        // check for collision with top edge
        let tValues = calculateTCollisionValues(topMovementRay, collisionSegment.segment);
        moveT = tValues[0]; // store for potential collision resolve
        let segT1 = tValues[1];
        const mayCollide = isTValueInRange(moveT);

        // if we have a potential collision but no intersection, we test the bottom movement
        let segT2: number;
        if (mayCollide && !isTValueInRange(segT1)) {
            tValues = calculateTCollisionValues(bottomMovementRay, collisionSegment.segment);
            segT2 = tValues[1];
        }

        // we have a collision if either movement ray intersects with the wall, or the wall sits between them
        hasCollision = mayCollide // movement rays go past the wall segment
            && (isTValueInRange(segT1) // touches the upper corner movement ray
                || isTValueInRange(segT2) // touches the lower corner movement ray
                || areTValuesOnOppositeOutsideRange(segT1, segT2)); // wall sits between upper and lower movement rays
    }

    if (hasCollision) {
        collisionTracker.setPotentialCollision({
            movementT: moveT,
            collisionSegment: collisionSegment,
            collisionType: collisionType,
            pathIndex: pathIndex
        });
    }
}

/**
 * Perform point collision checks against all given collisions and stores the earliest collision along the given entity
 * movement into the collision tracker.
 * @param movementRay 
 * @param pathIndex 
 * @param collisionTracker 
 * @param collisionType 
 * @param typeCheck 
 */
function performPointCollisions( movementRay: IRay,
                                 pathIndex: number,
                                 collisionTracker: WorldCollisionTracker,
                                 collisionType: CollisionType,
                                 typeCheck: ISurfaceTypeCheck): void {
    collisionTracker.relevantCollisionSegments.forEach((collisionSegment, id) => {
        if (!collisionTracker.hasSegmentAlreadyBeenResolved(id) && typeCheck(collisionSegment)) {
            checkPointCollisionOnSegment(movementRay, pathIndex, collisionSegment, collisionTracker, collisionType);
        }
    });
}

/**
 * Perform wall collision checks against all given collisions and stores the earliest collision along the given entity
 * movement offsets at the top and bottom corners into the collision tracker.
 * @param topMovementRay 
 * @param bottomMovementRay 
 * @param pathIndex 
 * @param collisionTracker 
 * @param collisionType 
 */
function performWallCollisions( topMovementRay: IRay,
                                bottomMovementRay: IRay,
                                pathIndex: number,
                                collisionTracker: WorldCollisionTracker,
                                collisionType: CollisionType): void {
    collisionTracker.relevantCollisionSegments.forEach((collisionSegment, id) => {
        if (!collisionTracker.hasSegmentAlreadyBeenResolved(id) && isWall(collisionSegment)) {
            checkWallCollisionOnSegment(
                topMovementRay, 
                bottomMovementRay, 
                pathIndex, 
                collisionSegment, 
                collisionTracker, 
                collisionType
            );
        }
    });
}

 /**
  * Performs collision checks with floor or ceiling segments for an entity and constructs a path when it resolves
  * collisions.
  * @param collisionTracker 
  * @param movementRay 
  * @param collisionType 
  * @param surfaceTypeCheck 
  * @param resolveDirection 
  */
function buildPointCollisionResolvePath( collisionTracker: WorldCollisionTracker,
                                         collisionType: CollisionType,
                                         getMovementRay: () => IRay,
                                         surfaceTypeCheck: ISurfaceTypeCheck, 
                                         resolveDirection: IVector): boolean {
    let shouldContinueChecking = true;
    let hasCollision = false;
    while (shouldContinueChecking) {
        // collision check
        performPointCollisions(getMovementRay(), -1, collisionTracker, collisionType, surfaceTypeCheck);

        // if we found a collision, resolve to it. If we resolve off of the edge of the collision segment, then
        // we will need to perform another collision check
        if (collisionTracker.hasCollisionDetectionData()) {
            resolveWithExternalDirection(collisionTracker, resolveDirection);
            shouldContinueChecking = collisionTracker.hasRemainingMovement();
            hasCollision = true;
        }

        // if no collision occurs this iteration, then we are done
        else {
            shouldContinueChecking = false;
        }
    }
    return hasCollision;
}

/**
 * Performs collision checks with wall segments for an entity and constructs a path when it resolves collisions.
 * @param collisionTracker 
 * @param topMovementRay 
 * @param bottomMovementRay 
 * @param resolveDirection 
 */
function buildWallCollisionResolvePath( collisionTracker: WorldCollisionTracker, resolveDirection: IVector): boolean {
    const collisionType = new CollisionType(
        collisionTracker.currentMovement.v.x > 0 ? CollisionFlag.RightWall : CollisionFlag.LeftWall
    );
    let hasCollision = false;
    let shouldContinueChecking = true;
    while (shouldContinueChecking) {
        // get the bottom and top corner movement rays
        const movementRays = collisionTracker.getRemainingMovementWithWallOffsets();

        // collision checks
        performWallCollisions(movementRays[1], movementRays[0], -1, collisionTracker, collisionType);

        // if we found a collision, resolve to it. If we resolve off of the edge of the collision segment, then
        // we will need to perform another collision check
        if (collisionTracker.hasCollisionDetectionData()) {
            resolveWithExternalDirection(collisionTracker, resolveDirection);
            hasCollision = true;
            shouldContinueChecking = collisionTracker.hasRemainingMovement();
        }

        // if no collision occurs this iteration, then we are done
        else {
            shouldContinueChecking = false;
        }
    }
    return hasCollision;
}

 /**
  * Performs collision checks for floor or ceiling segments and resolves collisions along the resolve path.
  * @param collisionTracker 
  * @param getOffsetFunc 
  * @param collisionType 
  * @param surfaceTypeCheck 
  */
function performPointCollisionPathResolve( collisionTracker: WorldCollisionTracker,
                                           getOffsetFunc: (index: number) => IResolvePathEntry,
                                           collisionType: CollisionType,
                                           surfaceTypeCheck: ISurfaceTypeCheck): void {
    // we iterate through the parts of the resolve path, starting at the beginning of the entity movement path
    // We break from this once we have found a collision are a part of the path
    collisionTracker.currentResolvePath.some((path: IResolvePathEntry, index:number) => {
        const pathEntry = getOffsetFunc(index);
        // collision checks
        performPointCollisions(pathEntry.ray, index, collisionTracker, collisionType, surfaceTypeCheck);

        // if we have a collision, resolve along the resolve path and break out of our path segment loop
        const result = collisionTracker.hasCollisionDetectionData();
        if (result) {
            resolveByPath(collisionTracker);
        }
        return result;
    });
}

/**
 * Performs collision checks for wall segments and resolves collisions along the resolve path.
 * @param collisionTracker 
 */
function performWallCollisionPathResolve( collisionTracker: WorldCollisionTracker): void {
    collisionTracker.currentResolvePath.some((path: IResolvePathEntry, index: number) => {
        // get the offsetted path at index and dtermine if collision type is left or right wall
        const pathEntries = collisionTracker.getPathAtIndexWithWallOffset(index);
        const v = pathEntries[0].ray.v;
        const collisionType = new CollisionType(v.x > 0 ? CollisionFlag.RightWall : CollisionFlag.LeftWall);

        // collision checks
        performWallCollisions(pathEntries[1].ray, pathEntries[0].ray, index, collisionTracker, collisionType);

        // if we have a collision, resolve along the resolve path and break out of our path segment loop
        const result = collisionTracker.hasCollisionDetectionData();
        if (result) {
            resolveByPath(collisionTracker);
        }
        return result;
    });
}

/**
 * Performs all world collisions for an entity and calculates the collision resolves.
 * 
 * It first tries to build a resolve path for floors, then for ceilings (if there were no floor detections), then for
 * walls (if there were no ceiling detections).
 * 
 * If a resolve path was formed for any one of these types of segments, we then do collision detection again on the
 * other two types of segments since the movement path has changed from our initial move direction. At this point,
 * resolves are calculating by moving back along the resolve path.
 * @param collisionTracker 
 */
function performWorldCollisionsForEntity(collisionTracker: WorldCollisionTracker): void {
    // try to build resolve path on floors
    let hasFloorCollision = collisionTracker.hasResolvePath();
    if (!hasFloorCollision) {
        hasFloorCollision = buildPointCollisionResolvePath(
            collisionTracker,
            new CollisionType(CollisionFlag.Floor),
            () => {return collisionTracker.getRemainingMovementWithFloorOffset()},
            isFloor,
            createVector(0, -1)
        );
    }

    // if no floor collisions, try to build resolve path on ceiling
    let hasCeilingCollision = false;
    if (!hasFloorCollision) {
        hasCeilingCollision = buildPointCollisionResolvePath(
            collisionTracker,
            new CollisionType(CollisionFlag.Ceiling),
            () => {return collisionTracker.getRemainingMovementWithCeilingOffset()},
            isCeiling,
            createVector(0, 1)
        );
    }

    // if no floor and no ceiling collisions, try to build resolve path on walls
    let hasWallCollision = false;
    if (!hasFloorCollision && !hasCeilingCollision) {
        const wallMovementRays = collisionTracker.getRemainingMovementWithWallOffsets();
        hasWallCollision = buildWallCollisionResolvePath(
            collisionTracker,
            createVector(wallMovementRays[0].v.x > 0 ? -1 : 1, 0)
        );
    }

    // at this point, finish off the resolve path if there is a remaining movement vector
    collisionTracker.completePath();

    // if we have not gotten any collisions, then we are done
    if (!hasFloorCollision && !hasCeilingCollision && !hasWallCollision) {
        return;
    }

    // if we had collisions and they weren't floor collisions, then perform floor collision checks again and resolve to
    // resolve path
    if (!hasFloorCollision) {
        performPointCollisionPathResolve(
            collisionTracker, 
            (index: number) => collisionTracker.getPathAtIndexWithFloorOffset(index),
            new CollisionType(CollisionFlag.Floor),
            isFloor
        );
    }

    // if we had collisions and they weren't ceiling collisions, then perform ceiling collision checks again and resolve
    // to resolve path
    if (!hasCeilingCollision) {
        performPointCollisionPathResolve(
            collisionTracker, 
            (index: number) => collisionTracker.getPathAtIndexWithCeilingOffset(index),
            new CollisionType(CollisionFlag.Ceiling),
            isCeiling
        );
    }

    // if we had collisions and they weren't wall collisions, then perform wall collision checks again and resolve to
    // resolve path
    if (!hasWallCollision) {
        performWallCollisionPathResolve(collisionTracker);
    }
}

/**
 * If the given entity is attached to a segment, resolve to that segment.
 * @param entity 
 * @param collisionTracker 
 */
function updateAttachedCollisionForEntity(entity: IEntity, collisionTracker: WorldCollisionTracker): void {
    const collisionBehavior = entity.behavior.componentMap.getComponent(BehaviorCollisionComponent);
    if (collisionBehavior) {
        const attachedCollision = collisionTracker.relevantCollisionSegments.get(collisionBehavior.segId);
        if (attachedCollision) {
            const behaviorCollisionType = new CollisionType(collisionBehavior.collisionType);
            collisionTracker.setPotentialCollision({
                movementT: 0,
                collisionSegment: attachedCollision,
                collisionType: getCollisionTypeForAttachedSegment(attachedCollision, behaviorCollisionType),
                pathIndex: -1
            });
            resolveWithExternalDirection(collisionTracker, createVector(0, -1));
        }
    }
}

/**
 * Main world collision checking and resolving for a given entity.
 * @param entity 
 */
export function updateWorldCollisionsOnEntity(entity: IEntity, physicsConfig: IPhysicsConfig): void {
    // setup a collision tracker for the entity and perform checks and resolves
    const entityData = getEntityJsonData(entity.type);
    const entityCollision = entityData.collision;
    let collisionTracker = new WorldCollisionTracker(
        entity.movement.previousPosition, 
        entity.movement.position, 
        entityCollision.floorPoint, 
        entityCollision.ceilingPoint, 
        entityCollision.halfWidth);

    // if the entity is attached to a segment, then resolve to segment first
    if (physicsConfig.segmentAttachEnabled) {
        updateAttachedCollisionForEntity(entity, collisionTracker);
    }
    
    // perform collisions
    performWorldCollisionsForEntity(collisionTracker);

    // update the entity with the collision resolve results
    const eventQueue = GameEventQueue.getInstance();
    let collisionType = new CollisionType(CollisionFlag.None);
    let collisionSegments: ICollisionSegment[] = [];
    if (collisionTracker.hasResolvePath()) {
        const resolveData = collisionTracker.getFinalResolvePosition();
        entity.movement.setPosition(resolveData.position);
        collisionType = resolveData.collisionType;
        collisionSegments = resolveData.collisionSegments;
    }

    // queue event
    eventQueue.addToQueue(entity.id, new WorldCollisionEvent(collisionType, collisionSegments));
}
