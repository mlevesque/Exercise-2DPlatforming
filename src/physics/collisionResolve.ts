import { WorldCollisionTracker, IResolvePathEntry } from "./WorldCollisionTracker";
import { IVector, IRay, getEndOfRay, getPositionAlongRay, createRayPP, createRayPV } from "../utils/geometry";
import { calculateTCollisionValues, capT, getPointCollision, isTValueInRange, getLedgeCollisionData, getConnectedCollisionId } from "./util";
import { CollisionType } from "./collisionType";

/**
 * Returns a resolve path entry with the given information.
 * @param cappedT t value along the surface collision, capped between 0 and 1, inclusively
 * @param surfaceCollision collision surface resolved to
 * @param movement resolved movement ray
 * @param collisionType type of collision (floor, wall, ledge, etc)
 */
function buildResolvePathEntry( cappedT: number, 
                                surfaceCollision: IRay,
                                movement: IRay,
                                collisionType: CollisionType): IResolvePathEntry {
    const pathEnd = getPositionAlongRay(surfaceCollision, cappedT);
    return {
        ray: createRayPP(movement.p.x, movement.p.y, pathEnd.x, pathEnd.y),
        type: collisionType
    }
}

/**
 * Calculates a new movement ray if the resolve direction of the old movement ray goes beyond the collision surface.
 * This constructs a remainder movement ray that still goes in the same direction as the old movement ray, just starts
 * at the start (appedT == 0) or end (cappedT == 1) of the collision surface.
 * @param cappedT 0 or 1, reprsenting the edge of the collision surface on the end where the resolve occurred
 * @param surfaceCollision collison surface
 * @param movement old movement ray
 * @param resolveRay resolve direction of the movement to the surface collision
 */
function buildUpdatedMovementRay( cappedT: number, surfaceCollision: IRay, movement: IRay, resolveRay: IRay): IRay {
    let newRay = {p: getPositionAlongRay(surfaceCollision, cappedT), v: movement.v};
    const newRayEnd = getPointCollision(newRay, resolveRay);
    return createRayPP(newRay.p.x, newRay.p.y, newRayEnd.x, newRayEnd.y);
}

/**
 * Resolves collision and adds it to the resolve path. Returns the t position along the surface collision this resolves
 * to. A returned t value that is < 0 or > 1 means that this resolved to a position beyond the collision surface.
 * @param collisionTracker stores collision information and the resolve path
 * @param resolveDirection direction at which to resolve the movement to the surface collision
 * @param surfaceCollision collision surface to resolve to
 * @param movementT t position along the movement ray where the collison occurred. If the resolve direction is parallel
 *      to the surface collision, then this resolves to this t value position.
 * @param collisionType type of collision this is resolving to (floor, wall, ledge, etc)
 */
function addToResolvePath( collisionTracker: WorldCollisionTracker, 
                           resolveDirection: IVector,
                           surfaceCollision: IRay, 
                           movementT: number, 
                           collisionType: CollisionType): number {
    
    const resolveRay: IRay = {p: getEndOfRay(collisionTracker.currentMovement), v: resolveDirection};
    const resolvePairT: [number, number] = calculateTCollisionValues(surfaceCollision, resolveRay);

    // if the resolve pair is infinite, then the collision segment and the resolve direction are parallel.
    // if this is the case, then we will use the collision point as our resolve point
    const t = isFinite(resolvePairT[0]) ? resolvePairT[0] : movementT;
    const cappedT = capT(t);

    // if t is outside the range, then we need to calculate a remaining movement ray after we resolve to the collision
    // segment.
    let remainingMovement: IRay = !isTValueInRange(t, true) 
        ? buildUpdatedMovementRay(cappedT, surfaceCollision, collisionTracker.currentMovement, resolveRay) : null;

    // add path entry
    collisionTracker.addToResolvePath(
        buildResolvePathEntry(cappedT, surfaceCollision, collisionTracker.currentMovement, collisionType),
        remainingMovement
    );

    if (collisionType.hasWallCollision()) {
        const entry = collisionTracker.getPathEntryAtIndex(collisionTracker.currentResolvePath.length - 1);
    }

    // return the t value from our resolve
    return t;
}

/**
 * Performs collison resolve to the stored surface collision, resolving to the surface itself first, then potentially
 * resolving to a ledge of the surface if there is remaining movement after the resolve.
 * @param collisionTracker 
 * @param resolveDirection 
 */
function resolveToSegment(collisionTracker: WorldCollisionTracker, resolveDirection: IVector): void {
    // find the intersection from the resolve direction and the collision segment
    const d = collisionTracker.currentCollisionDetectionData;
    const collisionSegment = d.collisionSegment;
    const collisionType = d.collisionType;
    const offsetSegment = collisionTracker.getCollisionSegmentWithOffset(collisionSegment.segment, collisionType);

    // resolve the collision segment
    // this will return the t value location along the collision segment that can tell us if we resolved off the
    // edge of the segment
    const t = addToResolvePath(collisionTracker, resolveDirection, offsetSegment, d.movementT, d.collisionType);

    // we are done with this collision
    collisionTracker.completeCurrentCollision();

    // if the resulting t value is within range of 0 and 1, then we have completed our resolve path
    if (isTValueInRange(t, true)) {
        collisionTracker.completePath();
    }
    // if the resulting t value from our resolve is not in the range of 0 and 1,
    // then we either need to resolve to a possible ledge, or a connected segment
    else {
        // if we have a ledge, then resolve to it
        const ledgeInfo = getLedgeCollisionData(t, collisionSegment);
        if (!ledgeInfo.hasNoCollision()) {
            collisionTracker.setPotentialCollision({
                movementT: 0,
                collisionSegment: collisionSegment,
                collisionType: ledgeInfo,
                pathIndex: -1
            });
            resolveToSegmentLedge(collisionTracker, resolveDirection);
        }

        // otherwise, if there is a connecting segment, we should resolve to that
        else {
            // try to get next segment
            const nextSegId = getConnectedCollisionId(t, collisionSegment);
            const nextSeg = collisionTracker.relevantCollisionSegments.get(nextSegId);
            if (nextSeg) {
                collisionTracker.setPotentialCollision({
                    movementT: 0,
                    collisionSegment: nextSeg,
                    collisionType: collisionType,
                    pathIndex: -1
                });
                resolveToSegment(collisionTracker, resolveDirection);
            }
        }
    }
}

/**
 * Performs collision resolve to segment ledges of the stored collision segment, resolving to the ledge surface first,
 * then potentially resolving to the segment itself if there is remaining movement after the resolve.
 * @param collisionTracker 
 * @param resolveDirection 
 */
function resolveToSegmentLedge(collisionTracker: WorldCollisionTracker, resolveDirection: IVector): void {
    // build ledge and offset it by the entity collision offset
    const d = collisionTracker.currentCollisionDetectionData;
    const collisionSegment = d.collisionSegment;
    const offsetLedgeRay = collisionTracker.getCollisionSegmentWithOffset(d.collisionSegment.segment, d.collisionType);

    // resolve to ledge
    const t = addToResolvePath(collisionTracker, resolveDirection, offsetLedgeRay, d.movementT, d.collisionType);

    // we are done with this collision
    collisionTracker.completeCurrentCollision();

    // if resulting t goes beyond the ledge and towards the collision segment itself, then resolve to segment
    if (t < 0) {
        let collisionType = new CollisionType(d.collisionType.rawValue);
        collisionType.unsetLedge();
        collisionTracker.setPotentialCollision({
            movementT: 0,
            collisionSegment: collisionSegment,
            collisionType: collisionType,
            pathIndex: -1
        });
        resolveToSegment(collisionTracker, resolveDirection);
    }

    // if the resulting t value is within range of 0 and 1, then we have completed our resolve path
    else if (isTValueInRange(t, true)) {
        collisionTracker.completePath();
    }
}

/**
 * Performs collision resolve to wall segments for the stored collision segment.
 * @param collisionTracker 
 */
function resolveToWallSegment(collisionTracker: WorldCollisionTracker): void {
    const d = collisionTracker.currentCollisionDetectionData;
    const movement = collisionTracker.currentMovement;
    const offsetWall = collisionTracker.getCollisionSegmentWithOffset(d.collisionSegment.segment, d.collisionType);
    collisionTracker.addToResolvePath(
        {
            ray: createRayPV(movement.p.x, movement.p.y, offsetWall.p.x - movement.p.x, movement.v.y),
            type: d.collisionType
        },
        null
    );
}

/**
 * Resolves collision into the direction of the given resolve direction and adds the resolve to the resolve path.
 * @param collisionTracker 
 * @param resolveDirection 
 */
export function resolveWithExternalDirection(collisionTracker: WorldCollisionTracker, resolveDirection: IVector): void {
    const data = collisionTracker.currentCollisionDetectionData;
    if (data.collisionType.hasWallCollision()) {
        resolveToWallSegment(collisionTracker);
    }
    else if (data.collisionType.hasLedgeCollision()) {
        resolveToSegmentLedge(collisionTracker, resolveDirection);
    }
    else {
        resolveToSegment(collisionTracker, resolveDirection);
    }
}

/**
 * Resolves collision into the direction of the resolve path and updates the resolve path with the result.
 * @param collisionTracker 
 */
export function resolveByPath(collisionTracker: WorldCollisionTracker): void {
    const data = collisionTracker.currentCollisionDetectionData;

    // index must be valid
    const pathEntry = collisionTracker.getPathEntryAtIndex(data.pathIndex);
    if (pathEntry) {
        // update the ray of the entry to the collison t position
        const newEndPos = getPositionAlongRay(pathEntry.ray, data.movementT);
        const newRay = createRayPP(pathEntry.ray.p.x, pathEntry.ray.p.y, newEndPos.x, newEndPos.y);
        let newType = new CollisionType(pathEntry.type.rawValue);
        newType.addType(data.collisionType);

        // update resolve path
        collisionTracker.setUpdatedEndPath(data.pathIndex, newRay, newType);
    }
}
