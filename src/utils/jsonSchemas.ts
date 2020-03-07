import gameConfig from "../assets/json/gameConfig.json";
import entityPlayer from "../assets/json/entityPlayer.json";
import { IVector } from "./geometry";
import { EntityType } from "../redux/state";

export interface IGameConfigSchema {
    tileSize: number;
    gravity: IVector;
}

export interface IImagesSchema {
    [id: string]: string;
}

export interface IMapCollisionSchema {
    x: number;
    y: number;
}
export interface IMapSchema {
    tileset: string;
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
export interface IEntitySchema {
    spritesheet: string;
    animations: {
        [id: string]: IAnimationSchema;
    };
    speed: number;
    collision: IEntityCollisionSchema;
}

export interface IJumpDuration {
    keyDuration: number;
    impulseDuration: number;
}
export interface IJumpSchema {
    speed: number;
    initialDuration: number;
    additionalDurations: IJumpDuration[];
}
export interface IPlayerSchema extends IEntitySchema {
    jump: IJumpSchema;
}

export function getGameConfig(): IGameConfigSchema {
    return gameConfig as IGameConfigSchema;
}

export function getEntityJsonData(type: EntityType): IEntitySchema {
    switch (type) {
        case EntityType.Player:
            return entityPlayer as IPlayerSchema;
    }
}
