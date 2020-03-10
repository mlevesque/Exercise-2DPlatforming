import { IMap, ICamera } from "../redux/state";
import { getImage } from "./utils";
import { getGameConfig } from "../utils/jsonSchemas";
import { createVector } from "../utils/geometry";

export function renderBackground(ctx: CanvasRenderingContext2D, map: IMap, camera: ICamera): void {
    const image = getImage(map.background);
    if (!image) {
        return;
    }

    // determine the size of the background
    const mapWidth = ctx.canvas.width * map.backgroundParalax;
    const mapHeight = ctx.canvas.height * map.backgroundParalax;
    const scale = Math.max(mapWidth / image.width, mapHeight / image.height);

    const camPosNormalized = createVector(
        (camera.positionData.position.x - camera.halfWidth) / (map.width - 2 * camera.halfWidth),
        (camera.positionData.position.y - camera.halfHeight) / (map.height - 2 * camera.halfHeight)
    );

    const x = camPosNormalized.x * ((image.width * scale) - ctx.canvas.width);
    const y = camPosNormalized.y * ((image.height * scale) - ctx.canvas.height);

    ctx.drawImage(image, -x, -y, image.width * scale, image.height * scale);
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
