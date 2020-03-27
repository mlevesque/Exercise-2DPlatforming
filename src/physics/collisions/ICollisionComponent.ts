import { CollisionType } from "./collisionType";

/**
 * Interface for an entity collision component.
 */
export interface ICollisionComponent {
    readonly attachedSegmentId: string;
    readonly attachedCollisionType: CollisionType;
    readonly currentCollisions: CollisionType;

    setAttachedSegment(segmentId: string, type: CollisionType): void;
    clearAttachedSegment(): void;
    setCurrentCollisions(collisionType: CollisionType): void;
}

/**
 * Collision component for an entity.
 */
class CollisionComponent implements ICollisionComponent {
    private _attachedSegmentId: string;
    private _attachedCollisionType: CollisionType;
    private _currentCollisions: CollisionType;

    constructor() {
        this.clearAttachedSegment();
    }

    public get attachedSegmentId(): string {return this._attachedSegmentId}
    public get attachedCollisionType(): CollisionType {return this._attachedCollisionType}
    public get currentCollisions(): CollisionType {return this._currentCollisions}

    public setAttachedSegment(segmentId: string, type: CollisionType): void {
        this._attachedSegmentId = segmentId;
        this._attachedCollisionType = type;
    }

    public clearAttachedSegment(): void {
        this.setAttachedSegment("", new CollisionType());
    }

    public setCurrentCollisions(collisionType: CollisionType): void {
        this._currentCollisions = collisionType;
    }
}

/**
 * Builds and returns a collision component.
 */
export function buildCollisionComponent(): ICollisionComponent {
    return new CollisionComponent();
}
