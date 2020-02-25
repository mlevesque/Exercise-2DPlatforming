import { ICollisionSegment } from "../../model/collisions.model";

export interface ISegmentTypeCheck { (segment: ICollisionSegment): boolean }

export function isFloor(segment: ICollisionSegment): boolean {
    return segment.normal.y < 0;
}

export function isCeiling(segment: ICollisionSegment): boolean {
    return segment.normal.y > 0;
}

export function isWall(segment: ICollisionSegment): boolean {
    return segment.normal.y == 0;
}
