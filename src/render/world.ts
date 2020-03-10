import { IMap } from "../redux/state";
import { getImage } from "./utils";
import { getGameConfig } from "../utils/jsonSchemas";

export function renderBackground(ctx: CanvasRenderingContext2D, map: IMap): void {
    const image = getImage(map.background);
    if (!image) {
        return;
    }

    // determine the size of the background
    const mapWidth = ctx.canvas.width;
    const mapHeight = ctx.canvas.height;
    const scale = Math.max(mapWidth / image.width, mapHeight / image.height);
    ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
}

export function renderTiles(ctx: CanvasRenderingContext2D, map: IMap): void {
    // get tileset image
    const image = getImage(map.tileset);
    if (!image) {
        return;
    }

    const config = getGameConfig();
    const size = config.tileSize;
    map.tiles.forEach((columns: number[], indexY: number) => {
        let y = indexY * size;
        columns.forEach((value: number, indexX: number) => {
            let tileX = (value % 16) * size;
            let tileY = Math.floor(value / 16) * size;
            let x = indexX * size;
            ctx.drawImage(image, tileX, tileY, size, size, x, y, size, size);
        });
    });
}
