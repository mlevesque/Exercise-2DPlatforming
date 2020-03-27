import { IEntity, EntityType } from "./IEntity";

/**
 * Singleton class container for all entities.
 */
export class EntityCollection {
    /** Singleton instance. */
    private static _instance: EntityCollection = null;

    /** Map of all entities. */
    private _entityMap: Map<string, IEntity>;
    /** The player entity */
    private _player: IEntity;

    /** Constructor. */
    private constructor() {
        this.clearEntityMap();
    }

    /**
     * Returns the singleton instance of this class.
     */
    public static getInstance(): EntityCollection {
        if (!this._instance) {
            this._instance = new EntityCollection();
        }
        return this._instance;
    }

    /**
     * Empties the entity map container.
     */
    public clearEntityMap() {
        this._entityMap = new Map();
        this._player = null;
    }

    /**
     * Adds the given entity to the collection.
     * @param entity 
     */
    public addEntity(entity: IEntity): void {
        this._entityMap.set(entity.id, entity);
        if (entity.type == EntityType.Player && !this._player) {
            this._player = entity;
        }
    }

    /**
     * Removes the entity with the given id from the collection.
     * @param id 
     */
    public removeEntity(id: string): void {
        this._entityMap.delete(id);
        if (this._player && this._player.id === id) {
            this._player = null;
        }
    }

    /**
     * Returns the entity with the given id.
     * @param id 
     */
    public getEntity(id: string): IEntity {
        return this._entityMap.get(id);
    }

    /**
     * Returns the player entity if it exists.
     */
    public getPlayer(): IEntity {
        return this._player;
    }

    /**
     * Returns a list of all entities in the collection.
     */
    public getAllEntities(): IEntity[] {
        return [...this._entityMap.values()];
    }
}
