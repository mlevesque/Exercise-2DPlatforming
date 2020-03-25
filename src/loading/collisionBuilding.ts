import { IMapSchema, IMapCollisionSchema } from "../utils/jsonSchemas";
import { ICollisionSegment, createSegment } from "../physics/collisions/CollisionSegment";
import { areVectorsEqual, getEndOfRay, cloneVector, createVector, IVector, cross, add, createRayPV } 
    from "../utils/geometry";
import { isWall, isFloor, isCeiling, calculateTCollisionValues } from "../physics/util";

/**
 * Returns true if the end of the first given segment is positioned at the start of the second given segment.
 * @param segment1 
 * @param segment2 
 */
function areSegmentsConnected(segment1: ICollisionSegment, segment2: ICollisionSegment): boolean {
    return areVectorsEqual(getEndOfRay(segment1.segment), segment2.segment.p);
}

/**
 * Returns true if the two segments are a combo of a floor and a ceiling and form a convex corner (the normals point
 * outward instead of inward).
 * @param segmentA 
 * @param segmentB 
 */
function needsWallSegmentConnector(segmentA: ICollisionSegment, segmentB: ICollisionSegment): boolean {
    return ((isFloor(segmentA) && isCeiling(segmentB)) || (isFloor(segmentB) && isCeiling(segmentA)))
        && cross(segmentA.segment.v, segmentB.segment.v) > 0;
}

/**
 * Builds a tiny wall in between the two given segments. This is called if there are two segments connected together
 * that are a floor-ceiling combo.
 * @param segmentA 
 * @param segmentB 
 */
function buildWallSegmentConnector(segmentA: ICollisionSegment, segmentB: ICollisionSegment): ICollisionSegment {
    // we need to build the wall between the two segments, both the connection between the two segments has a distance
    // of zero. We can't make a zero vector wall, so the wall will be a subpixel tall, which will cause an overlap.
    // We don't want this overlap to happen against the floor segment because it would mean that entities can't walk
    // right off the ledge, so we need to find out which segment is the floor one and then adjust the wall to overlap
    // the other one
    const floorA = isFloor(segmentA);
    let startPos = getEndOfRay(segmentA.segment);
    let endPos = cloneVector(segmentB.segment.p);
    if (floorA) endPos.y += 0.1;
    else startPos.y += 0.1;
    return createSegment(startPos, endPos);
}

/**
 * Links the first segment to the second.
 * @param segment1 
 * @param segment2 
 */
function linkCollisions(segment1: ICollisionSegment, segment2: ICollisionSegment): void {
    if (segment1) segment1.nextSegment = segment2 ? segment2.id : "";
    if (segment2) segment2.prevSegment = segment1 ? segment1.id : "";
}

function doesFormConvex(segmentA: ICollisionSegment, segmentB: ICollisionSegment): boolean {
    const segA = segmentA.nextSegment == segmentB.id ? segmentA : segmentB;
    const segB = segmentA.nextSegment == segmentB.id ? segmentB : segmentA;
    const sumVec = add(segA.segment.v, segB.segment.v);
    const sumRay = createRayPV(segA.segment.p.x, segA.segment.p.y, sumVec.x, sumVec.y);
    const normRay = createRayPV(segB.segment.p.x, segB.segment.p.y, segB.normal.x, segB.normal.y);
    return calculateTCollisionValues(normRay, sumRay)[0] < 0;
}

/**
 * Checks if the connected surface and wall segments form a ledge. A ledge is defined as if the surface segment is
 * a floor or ceiling segment, the wall segment is a wall or is null, and if the wall segment goes in a direction
 * opposite of the surface segment's normal.
 * @param segmentA 
 * @param segmentB 
 */
function isLedgeFromSegmentAToSegmentB(segmentA: ICollisionSegment, segmentB: ICollisionSegment): boolean {
    // surface must exist and not be a wall
    if (!segmentA || isWall(segmentA)) {
        return false;
    }

    // if second segment does not exist, then we have a ledge
    if (!segmentB) {
        return true;
    }

    // if second segment is not a wall, then this cannot be a ledge
    if (!isWall(segmentB)) {
        return false;
    }

    // make sure that they are connected
    if (segmentA.nextSegment != segmentB.id && segmentA.prevSegment != segmentB.id) {
        return false;
    }

    // finally, make sure that the angle between the two segments forms a convex angle with respect to the normals
    return doesFormConvex(segmentA, segmentB);
}

/**
 * Returns a list of all collision segments built from the given collision set.
 * @param collisionSet 
 */
function buildCollisionSet(collisionSet: IMapCollisionSchema[]): ICollisionSegment[] {
    // do nothing here if the set is empty or only has one entry
    if (collisionSet.length < 2) {
        return;
    }

    // build segments from collision set
    let segmentList: ICollisionSegment[] = [];
    let startPos: IVector = createVector(collisionSet[0].x, collisionSet[0].y);
    for (let i = 1; i < collisionSet.length; ++i) {
        let endPos = createVector(collisionSet[i].x, collisionSet[i].y);
        let segment = createSegment(startPos, endPos);
        segmentList.push(segment);
        startPos = endPos;
    }

    // if the first and last segments should be connected, add the first segment again to the end of the list
    // this will help us process the segment linking
    const endsConnected = segmentList.length > 1 
        && areSegmentsConnected(segmentList[segmentList.length - 1], segmentList[0]);
    if (endsConnected) {
        segmentList.push(segmentList[0]);
    }

    // add wall connectors if any two congruent segments are a floor-ceiling combo
    let prevSegment = segmentList[0];
    for (let i = 1; i < segmentList.length; ++i) {
        let currentSegment = segmentList[i];
        if (needsWallSegmentConnector(prevSegment, currentSegment)) {
            let wallSegment = buildWallSegmentConnector(prevSegment, currentSegment);
            segmentList = [...segmentList.slice(0, i), wallSegment, ...segmentList.slice(i)];
            i++;
        }
        prevSegment = currentSegment;
    }

    // connect all segments and setup ledges
    prevSegment = segmentList[0];
    for (let i = 1; i < segmentList.length; ++i) {
        let currentSegment = segmentList[i];
        linkCollisions(prevSegment, currentSegment);
        prevSegment.endLedge = isLedgeFromSegmentAToSegmentB(prevSegment, currentSegment);
        currentSegment.startLedge = isLedgeFromSegmentAToSegmentB(currentSegment, prevSegment);
        prevSegment = currentSegment;
    }

    // return the list, but without the duplicate segment end if there is one
    return endsConnected ? segmentList.slice(0, segmentList.length - 1) : segmentList;
}

/**
 * Builds and returns a collection of collisions from the given map data.
 * @param map 
 */
export function buildCollisionsCollection(map: IMapSchema): ICollisionSegment[] {
    // build all collisions
    let results: ICollisionSegment[] = [];
    if (map && map.collisions) {
        map.collisions.forEach(collisonSet => results = results.concat(buildCollisionSet(collisonSet)));
    }
    return results;
}
