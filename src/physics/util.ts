import { ICollisionSegment } from "./CollisionSegment";
import { subtract, cross, IRay, negate, IVector, getPositionAlongRay, dot } from "../utils/geometry";

/** Function interface for filtering out types of collision segments. */
export interface ISegmentTypeCheck { (segment: ICollisionSegment): boolean }

/** Filter for floor collision segments. */
export function isFloor(segment: ICollisionSegment): boolean {return segment.normal.y < 0}
/** Filter for ceiling collision segments. */
export function isCeiling(segment: ICollisionSegment): boolean {return segment.normal.y > 0}
/** Filter for wall collision segments. */
export function isWall(segment: ICollisionSegment): boolean {return segment.normal.y == 0}

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
 * Returns whether or not the given movement direction is moving towards the collision side of the collision segment.
 * The collision side of the collision segment is the side at which its normal protudes from.
 * @param movementRay 
 * @param segment 
 */
export function isMovingTowardSegment(movementDirection: IVector, segment: ICollisionSegment): boolean {
    return dot(movementDirection, segment.normal) <= 0;
}

/**
 * Returns true if the given t value is within 0 and 1, inclusively. The t value is a normalized value that describes
 * a position along a segment, with the value between 0 and 1 being on the segment and anything lying outside of it.
 * @param t 
 */
export function isTValueInRange(t: number): boolean {
    return t >= -0.00000001 && t <= 1.00000001;
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
