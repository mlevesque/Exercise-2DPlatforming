import { ICollisionSegment } from "../collisions/ICollisionSegment";

/**
 * Containers for all collision data for quick and easy lookup.
 */
export class CollisionCollections {
    /** Singleton instance of this class. */
    private static _instance: CollisionCollections = null;

    /** Mapping of all static world collisions. */
    private _staticCollisions: Map<string, ICollisionSegment>;

    /** Constructor. */
    private constructor() {
        this.clearAll();
    }

    /**
     * Returns the singleton instance of this class.
     */
    public static getInstance(): CollisionCollections {
        if (!this._instance) {
            this._instance = new CollisionCollections();
        }
        return this._instance;
    }

    /**
     * Empties the static collisions map.
     */
    public clearStaticCollisions(): void {
        this._staticCollisions = new Map();
    }

    /**
     * Empties all the collections of collisions.
     */
    public clearAll(): void {
        this.clearStaticCollisions();
    }

    /**
     * Adds the given static collision segment to the collection.
     * @param segment 
     */
    public addStaticCollisionSegment(segment: ICollisionSegment): void {
        this._staticCollisions.set(segment.id, segment);
    }

    /**
     * Removes the collision segment with the given id from the collection.
     * @param id 
     */
    public removeCollisionSegment(id: string): void {
        this._staticCollisions.delete(id);
    }

    /**
     * Returns the collision segment with the given id if it exists. Returns null if it doesn't.
     * @param id 
     */
    public getCollisionSegment(id: string): ICollisionSegment {
        return this._staticCollisions.get(id);
    }

    /**
     * Returns array of all static collisions stored in the collection.
     */
    public getAllStaticCollisionSegments(): ICollisionSegment[] {
        return [...this._staticCollisions.values()];
    }
}
