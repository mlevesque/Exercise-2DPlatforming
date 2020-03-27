import { IBehavior } from "../behaviors/IBehavior";
import { ISpriteAnimation, buildSpriteAnimation } from "../animation/SpriteAnimation";
import { IMovementData, buildMovementData } from "../physics/integration/MovementData";
import { Guid } from "guid-typescript";
import { buildEntityBehavior } from "../behaviors/factory";
import { getEntityJsonData, IEntitySchema } from "../utils/jsonSchemas";
import { IVector } from "../utils/geometry";
import { ICollisionComponent, buildCollisionComponent } from "../physics/collisions/ICollisionComponent";

/**
 * Defines all types of entities.
 */
export enum EntityType {
    Player = "player",
}

/**
 * Interface for an entity.
 */
export interface IEntity {
    readonly id: string;
    readonly type: EntityType;
    readonly behavior: IBehavior;
    readonly spriteAnimation: ISpriteAnimation;
    readonly movement: IMovementData;
    readonly collisions: ICollisionComponent;
}

/**
 * Implementation of an entity.
 */
class Entity implements IEntity {
    private readonly _id: string;
    private readonly _type: EntityType;
    private readonly _behavior: IBehavior;
    private readonly _spriteAnimation: ISpriteAnimation;
    private readonly _movement: IMovementData;
    private readonly _collisions: ICollisionComponent;

    public constructor(type: EntityType, jsonData: IEntitySchema, position: IVector) {
        const id = Guid.create().toString();
        this._id = id;
        this._type = type;
        this._behavior = buildEntityBehavior(type);
        this._spriteAnimation = buildSpriteAnimation(id, jsonData.spritesheet, jsonData.animations);
        this._movement = buildMovementData(position);
        this._collisions = buildCollisionComponent();
    }

    public get id(): string {return this._id}
    public get type(): EntityType {return this._type}
    public get behavior(): IBehavior {return this._behavior}
    public get spriteAnimation(): ISpriteAnimation {return this._spriteAnimation}
    public get movement(): IMovementData {return this._movement}
    public get collisions(): ICollisionComponent {return this._collisions}
}

/**
 * Creates and returns an entity with the given type and position.
 * @param type 
 * @param position 
 */
export function buildEntity(type: EntityType, position: IVector): IEntity {
    const jsonData = getEntityJsonData(type);
    return new Entity(type, jsonData, position);
}
