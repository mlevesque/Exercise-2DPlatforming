import gameConfig from "../assets/json/gameConfig.json";
import levelList from "../assets/json/maps/level_list.json";
import mapTextures from "../assets/json/map_textures.json";
import entityPlayer from "../assets/json/entities/entityPlayer.json";
import { IVector } from "./geometry";
import { IAnimationMappingSchema } from "../animation/JsonSchema.js";
import { EntityType } from "../entities/IEntity";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONFIG
export interface IGameConfigSchema {
    tileSize: number;
    gravity: IVector;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LEVEL LIST
export interface ILevelListSchema {
    levels: string[];
}

export interface IMapTexture {
    name: string;
    file: string;
}
export interface IMapTexturesSchema {
    tilesets: IMapTexture[];
    backgrounds: IMapTexture[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAP
export interface IMapSchema {
    tileset: string;
    background: string;
    backgroundParallax: IVector,
    map: number[][];
    partition: {
        cellWidth: number;
        cellHeight: number;
    }
    player: {
        position: IVector;
        flip: boolean;
    }
    entities: {
        type: EntityType;
        position: IVector;
    }[];
    collisions: IMapCollisionSchema[][];
    gravity?: IVector;
}
export interface IMapCollisionSchema {
    x: number;
    y: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENTITY
export interface IEntitySchema {
    spritesheet: string;
    animations: IAnimationMappingSchema;
    speed: number;
    collision: IEntityCollisionSchema;
}
export interface IEntityCollisionSchema {
    floorPoint: IVector;
    ceilingPoint: IVector;
    halfWidth: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLAYER
export interface IPlayerSchema extends IEntitySchema {
    jump: IJumpSchema;
}
export interface IJumpSchema {
    speed: number;
    initialDuration: number;
    additionalDurations: IJumpDuration[];
}
export interface IJumpDuration {
    keyDuration: number;
    impulseDuration: number;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GETTERS
export function getGameConfig(): IGameConfigSchema {
    return gameConfig as IGameConfigSchema;
}
export function getLevelList(): ILevelListSchema {
    return levelList as ILevelListSchema;
}
export function getMapTextures(): IMapTexturesSchema {
    return mapTextures as IMapTexturesSchema;
}
export function getEntityJsonData(type: EntityType): IEntitySchema {
    switch (type) {
        case EntityType.Player:
            return entityPlayer as IPlayerSchema;
    }
}
