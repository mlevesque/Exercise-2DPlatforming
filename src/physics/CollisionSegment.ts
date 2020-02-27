import { IVector, cloneVector, subtract, IRay, createRay, cloneRay, normalize } from "../utils/geometry";

/**
 * Describes collision information for a single line segment. The normal represents which side is collidable.
 */
export interface ICollisionSegment {
    segment: IRay;
    normal: IVector;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Creation Methods
/**
 * Creates an instance of a collision segment with the given data. The normal is calculated by rotating and normalizing
 * the vector created from start to end.
 * @param start
 * @param end  
 */
export function createSegment(start: IVector, end: IVector): ICollisionSegment {
    let seg = subtract(end, start);
    let ray = createRay(start.x, start.y, seg.x, seg.y);
    return {
        segment: ray,
        normal: buildNormal(seg)
    }
}

/**
 * Makes an object clone of the given segment.
 * @param segment 
 */
export function cloneSegment(segment: ICollisionSegment): ICollisionSegment {
    return {
        segment: cloneRay(segment.segment),
        normal: cloneVector(segment.normal)
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Methods
/**
 * Builds a normal vector form the given vector. The normal is clockwise to the vector. Note that in the screen
 * coordinate system, y is flipped, so this will appear to make normals in the anti-clockwise direction.
 * @param v 
 */
export function buildNormal(v: IVector): IVector {
    return normalize({x: v.y, y: -v.x});
}