import { IVector, cloneVector, subtract, normal, IRay, createRay, cloneRay } from "./geometry.model";

export interface ICollisionSegment {
    segment: IRay;
    normal: IVector;
}

export function createSegment(start: IVector, end: IVector): ICollisionSegment {
    let seg = subtract(end, start);
    let ray = createRay(start.x, start.y, seg.x, seg.y);
    return {
        segment: ray,
        normal: normal(seg)
    }
}

export function cloneSegment(segment: ICollisionSegment): ICollisionSegment {
    return {
        segment: cloneRay(segment.segment),
        normal: cloneVector(segment.normal)
    }
}
