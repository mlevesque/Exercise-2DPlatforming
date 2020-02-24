import gameConfig from "./gameConfig.json";
import entityPlayer from "./entityPlayer.json";
import { EntityType, EntityAnimation } from "../../model/entity.model";
import { IPoint, IVector } from "../../model/geometry.model.js";

export interface IGameConfigSchema {
    tileSize: number;
    gravity: IVector;
}

export interface IImagesSchema {
    [id: string]: string;
}

export interface IMapCollisionSchema {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface IMapSchema {
    tileset: string;
    map: number[][];
    player: {
        position: IPoint;
        flip: boolean;
    }
    entities: {
        type: EntityType;
        position: IPoint;
    }[];
    collisions: IMapCollisionSchema[]
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
    floorPoint: IPoint;
}

export interface IEntitySchema {
    spritesheet: string;
    animations: {
        [id: string]: IAnimationSchema;
    };
    speed: number;
    collision: IEntityCollisionSchema;
}

export function getGameConfig(): IGameConfigSchema {
    return gameConfig as IGameConfigSchema;
}

export function getEntityJsonData(type: EntityType): IEntitySchema {
    switch (type) {
        case EntityType.Player:
            return entityPlayer as IEntitySchema;
    }
}
