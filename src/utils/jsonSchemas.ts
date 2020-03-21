import gameConfig from "../assets/json/gameConfig.json";
import levelList from "../assets/json/maps/level_list.json";
import entityPlayer from "../assets/json/entities/entityPlayer.json";
import { IVector } from "./geometry";
import { EntityType } from "../redux/state";

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
    animations: {
        [id: string]: IAnimationSchema;
    };
    speed: number;
    collision: IEntityCollisionSchema;
}
export interface IAnimationSchema {
    loops: boolean;
    frameCount: number;
    x: number;
    y: number;
    w: number;
    h: number;
    offX: number;
    offY: number;
    intervals: number[];
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
export function getEntityJsonData(type: EntityType): IEntitySchema {
    switch (type) {
        case EntityType.Player:
            return entityPlayer as IPlayerSchema;
    }
}
