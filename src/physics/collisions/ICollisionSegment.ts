import { IVector, IRay, normalize } from "../../utils/geometry";
import { Guid } from "guid-typescript";
import { CollisionType, CollisionFlag } from "./collisionType";
import { isFloor, isCeiling, isRightWall, isLeftWall } from "../util";

/**
 * Interface for a collision segment.
 */
export interface ICollisionSegment {
    readonly id: string;
    readonly segmentRay: IRay;
    readonly normal: IVector;
    readonly startLedge: boolean;
    readonly endLedge: boolean;
    readonly prevSegmentId: string;
    readonly nextSegmentId: string;
    setLedges(start: boolean, end: boolean): void;
    setLinks(previousId: string, nextId: string): void;
    getCollisionType(): CollisionType;
}

/**
 * A collision segment.
 */
class CollisionSegment implements ICollisionSegment {
    private readonly _id: string;
    private readonly _segmentRay: IRay;
    private readonly _normal: IVector;
    private _startLedge: boolean;
    private _endLedge: boolean;
    private _prevSegment: string;
    private _nextSegment: string;

    public constructor(segmentRay: IRay) {
        this._id = Guid.create().toString();
        this._segmentRay = segmentRay;
        this._normal = normalize({x: segmentRay.v.y, y: -segmentRay.v.x});
        this._startLedge = true;
        this._endLedge = true;
        this._prevSegment = "";
        this._nextSegment = "";
    }

    public get id(): string {return this._id}
    public get segmentRay(): IRay {return this._segmentRay}
    public get normal(): IVector {return this._normal}
    public get startLedge(): boolean {return this._startLedge}
    public get endLedge(): boolean {return this._endLedge}
    public get prevSegmentId(): string {return this._prevSegment}
    public get nextSegmentId(): string {return this._nextSegment}

    public setLedges(start: boolean, end: boolean): void {
        this._startLedge = start;
        this._endLedge = end;
    }

    public setLinks(previousId: string, nextId: string): void {
        this._prevSegment = previousId;
        this._nextSegment = nextId;
    }

    public getCollisionType(): CollisionType {
        return new CollisionType(
            isFloor(this) ? CollisionFlag.Floor
            : isCeiling(this) ? CollisionFlag.Ceiling
            : isRightWall(this) ? CollisionFlag.RightWall
            : isLeftWall(this) ? CollisionFlag.LeftWall
            : CollisionFlag.None
        );
    }
}

/**
 * Builds and returns a collision segment from the given ray.
 * @param segmentRay 
 */
export function buildCollisionSegment(segmentRay: IRay): ICollisionSegment {
    return new CollisionSegment(segmentRay);
}
