import gameConfig from "./gameConfig.json";

export interface IGameConfigSchema {
    tileSize: number;
}

export interface IImagesSchema {
    [id: string]: string;
}

export interface IMapSchema {
    tileset: string;
    map: number[][];
}

export function getGameConfig(): IGameConfigSchema {
    return gameConfig as IGameConfigSchema;
}
