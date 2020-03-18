import { ICollisionSegment } from "./CollisionSegment";
import { subtract, cross, IRay, negate, IVector, getPositionAlongRay, dot, createVector, getEndOfRay } 
    from "../utils/geometry";
import { CollisionType, CollisionFlag } from "./collisionType";

/** Function interface for filtering out types of collision segments. */
export interface ISurfaceTypeCheck { (segment: ICollisionSegment): boolean }

/** Filter for floor collision segments. */
export function isFloor(segment: ICollisionSegment): boolean {return segment.normal.y < 0}
/** Filter for ceiling collision segments. */
export function isCeiling(segment: ICollisionSegment): boolean {return segment.normal.y > 0}
/** Filter for wall collision segments. */
export function isWall(segment: ICollisionSegment): boolean {return segment.normal.y == 0}
/** Filter for left wall collision segments. */
export function isLeftWall(segment: ICollisionSegment): boolean {return isWall(segment) && segment.normal.x < 0}
/** Filter for right wall collision segments. */
export function isRightWall(segment: ICollisionSegment): boolean {return isWall(segment) && segment.normal.x > 0}

/**
 * Calculates the t values of both given rays where the two rays intersect. If the rays are parallel, then the t values
 * will be Infinity.
 * @param a 
 * @param b 
 */
export function calculateTCollisionValues(a: IRay, b: IRay): [number, number] {
    const pDist = subtract(b.p, a.p);
    const vCross = cross(a.v, b.v);
    return [cross(pDist, b.v) / vCross, -cross(negate(pDist), a.v) / vCross];
}

/**
 * Calculates and returns the point of projected intersection between the two rays. Note that rays are treated as
 * lines that span to infinity on both directions, so a point of intersection will be found even if the rays don't
 * actually intersect (but are not parallel).
 * @param a 
 * @param b 
 */
export function getPointCollision(a: IRay, b: IRay): IVector {
    const t = calculateTCollisionValues(a, b);
    return getPositionAlongRay(a, t[0]);
}

/**
 * Returns true if the given movement direction is moving towards the collision side of the given collision segment. The 
 * collision side of the collision segment is the side at which its normal protudes from.
 * @param movementRay 
 * @param segment 
 */
export function isMovingTowardSegment(movementDirection: IVector, segment: ICollisionSegment): boolean {
    return dot(movementDirection, segment.normal) <= 0;
}

/**
 * Returns true if the given movement directon is moveing towards the collision side of the ledges of the given
 * collision segment, if the segment has ledges.
 * @param movementDirection 
 * @param segment 
 */
export function isMovingTowardSegmentLedge(movementDirection: IVector, segment: ICollisionSegment): boolean {
    if (segment.startLedge || segment.endLedge) {
        const ledgeNormal = isFloor(segment) ? createVector(0, -1) : createVector(0, 1);
        return dot(movementDirection, ledgeNormal) <= 0;
    }
    return false;
}

/**
 * Returns true if the given t value is within 0 and 1, inclusively. The t value is a normalized value that describes
 * a position along a segment, with the value between 0 and 1 being on the segment and anything lying outside of it.
 * @param t 
 */
export function isTValueInRange(t: number, exact: boolean = false): boolean {
    if (exact) {
        return t >= 0 && t <= 1;
    }
    else {
        // note that we expand the range just slightly to account for precision error.
        return t >= -0.00000001 && t <= 1.00000001;
    }
}

/**
 * Returns true if the t value pairs is within 0 and 1, inclusively.
 * @param t1 
 * @param t2 
 */
export function areTValuePairsInRange(t1: number, t2: number): boolean {
    return isTValueInRange(t1) && isTValueInRange(t2);
}

/**
 * Returns true if the given t values from a collisio check against a segment ledge are within 0 and 1 inclusively, and
 * that the ledge t value is less than 1. This extra check fixes an issue where a entity jumping straight up along a
 * wall will not land on the ledge.
 * @param movementT 
 * @param ledgeT 
 */
export function areTValuesPairsInRangeForLedge(movementT: number, ledgeT: number): boolean {
    return ledgeT < 1 && areTValuePairsInRange(movementT, ledgeT);
}

/**
 * Returns true if one of the following is true:
 *  1) t1 <= 0 && t2 >= 1
 *  2) t1 >= 1 && t2 <= 0
 * @param t1 
 * @param t2 
 */
export function areTValuesOnOppositeOutsideRange(t1: number, t2: number): boolean {
    return (t1 <= 0 && t2 >= 1) || (t1 >= 1 && t2 <= 0);
}

/**
 * Caps the given t value to between 0 and 1, inclusively.
 * @param t 
 */
export function capT(t: number): number {
    if (t < 0) return 0;
    else if (t > 1) return 1;
    else return t;
}

/**
 * Returns the collision type for a start ledge for the given collision segment.
 * @param segment 
 */
export function getStartLedgeCollisionType(segment: ICollisionSegment): CollisionType {
    return new CollisionType(isFloor(segment) ? CollisionFlag.FloorStartLedge : CollisionFlag.CeilingStartLedge);
}

/**
 * Returns the collision type for an end ledge for the given collision segment.
 * @param segment 
 */
export function getEndLedgeCollisionType(segment: ICollisionSegment): CollisionType {
    return new CollisionType(isFloor(segment) ? CollisionFlag.FloorEndLedge : CollisionFlag.CeilingEndLedge);
}

/**
 * Returns a calculated start ledge ray with the given width from the given segment.
 * @param segmentRay 
 * @param width 
 */
export function buildStartLedgeRay(segmentRay: IRay, width: number): IRay {
    const distance = segmentRay.v.x > 0 ? -width : width;
    return {p: segmentRay.p, v: createVector(distance, 0)};
}

/**
 * Returns a calculated end ledge ray with the given width from the given segment.
 * @param segmentRay 
 * @param width 
 */
export function buildEndLedgeRay(segmentRay: IRay, width: number): IRay {
    const distance = segmentRay.v.x > 0 ? width : -width;
    return {p: getEndOfRay(segmentRay), v: createVector(distance, 0)};
}

/**
 * Returns what kind of ledge collision type the given segment will have at the given t value.
 * @param t 
 * @param seg 
 */
export function getLedgeCollisionData(t: number, seg: ICollisionSegment): CollisionType {
    if (t < 0 && seg.startLedge) {
        return getStartLedgeCollisionType(seg);
    }
    else if (t > 1 && seg.endLedge) {
        return getEndLedgeCollisionType(seg);
    }
    return new CollisionType();
}

/**
 * Returns the id of the next or previous segment based on the given t value. An empty string means that there is no
 * segment.
 * @param t 
 * @param seg 
 */
export function getConnectedCollisionId(t: number, seg: ICollisionSegment): string {
    if (t <= 0) {
        return seg.prevSegment;
    }
    else if (t >= 1) {
        return seg.nextSegment;
    }
    return "";
}

/**
 * Returns true if both segments have the same general direction.
 * @param segmentA 
 * @param segmentB 
 */
export function areSegmentsInSameGeneralDirection(segmentA: ICollisionSegment, segmentB: ICollisionSegment): boolean {
    return dot(segmentA.segment.v, segmentB.segment.v) > 0;
}

/**
 * Returns an appropriate collision type based on the given segment and the stored collision type from the entity
 * collision behavior. This is meant to isolate the collision type information for the specific attched collision
 * segment from any other collisions.
 * @param segment 
 * @param behaviorType 
 */
export function getCollisionTypeForAttachedSegment( segment: ICollisionSegment, 
                                                    behaviorType: CollisionType): CollisionType {
    let result = new CollisionType();
    if (isFloor(segment)) {
        result.setFlag(CollisionFlag.Floor);
        result.setFlag(behaviorType.rawValue & CollisionFlag.FloorStartLedge);
        result.setFlag(behaviorType.rawValue & CollisionFlag.FloorEndLedge);
    }
    else if (isCeiling(segment)) {
        result.setFlag(CollisionFlag.Ceiling);
        result.setFlag(behaviorType.rawValue & CollisionFlag.CeilingStartLedge);
        result.setFlag(behaviorType.rawValue & CollisionFlag.CeilingEndLedge);
    }
    else if (isLeftWall(segment)) {
        result.setFlag(CollisionFlag.LeftWall);
    }
    else if (isRightWall(segment)) {
        result.setFlag(CollisionFlag.RightWall);
    }
    return result;
}
