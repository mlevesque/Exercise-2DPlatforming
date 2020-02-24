import gameConfig from "./gameConfig.json";
import entityPlayer from "./entityPlayer.json";
import { EntityType, EntityAnimation } from "../../model/entity.model";
import { IPoint } from "../../model/collisions.model.js";

export interface IGameConfigSchema {
    tileSize: number;
}

export interface IImagesSchema {
    [id: string]: string;
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

export interface IEntitySchema {
    spritesheet: string;
    animations: {
        [id: string]: IAnimationSchema;
    };
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
