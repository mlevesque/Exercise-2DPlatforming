import { IVector, 
         cloneVector, 
         subtract, 
         IRay, 
         cloneRay, 
         normalize, 
         createRayPV, 
         vectorLength, 
         isPracticallyZero} from "../utils/geometry";
import { Guid } from "guid-typescript";

/**
 * Describes collision information for a single line segment. The normal represents which side is collidable.
 */
export interface ICollisionSegment {
    id: string;
    segment: IRay;
    normal: IVector;
    length: number;
    startLedge: boolean;
    endLedge: boolean;
    prevSegment: string;
    nextSegment: string;
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
    const seg = subtract(end, start);
    const ray = createRayPV(start.x, start.y, seg.x, seg.y);
    const isWall = isPracticallyZero(seg.x);
    return {
        id: Guid.create().toString(),
        segment: ray,
        normal: buildNormal(seg),
        length: vectorLength(seg),
        startLedge: !isWall,
        endLedge: !isWall,
        prevSegment: "",
        nextSegment: ""
    }
}

/**
 * Makes an object clone of the given segment.
 * @param segment 
 */
export function cloneSegment(segment: ICollisionSegment): ICollisionSegment {
    return {
        id: segment.id,
        segment: cloneRay(segment.segment),
        normal: cloneVector(segment.normal),
        length: segment.length,
        startLedge: segment.startLedge,
        endLedge: segment.endLedge,
        prevSegment: segment.prevSegment,
        nextSegment: segment.nextSegment
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
