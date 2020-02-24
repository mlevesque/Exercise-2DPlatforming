import { IPoint, IVector, cloneVector, subtract, normalize, normal } from "./geometry.model";

export interface ICollisionSegment {
    start: IPoint;
    segment: IVector;
    normal: IVector;
}

export function createSegment(start: IPoint, end: IPoint): ICollisionSegment {
    let seg = subtract(end, start);
    return {
        start: cloneVector(start),
        segment: seg,
        normal: normal(seg)
    }
}

export function cloneSegment(segment: ICollisionSegment): ICollisionSegment {
    return {
        start: cloneVector(segment.start),
        segment: cloneVector(segment.segment),
        normal: cloneVector(segment.normal)
    }
}
