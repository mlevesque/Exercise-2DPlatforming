import { IMap, ICamera } from "../redux/state";
import { getImage } from "./utils";
import { getGameConfig } from "../utils/jsonSchemas";
import { createVector, subtract, scale } from "../utils/geometry";

export function renderBackground(ctx: CanvasRenderingContext2D, map: IMap, camera: ICamera): void {
    const image = getImage(map.background);
    if (!image) {
        return;
    }

    // determine the size of the background
    const widthScale = ctx.canvas.width * map.backgroundParalax.x / image.width;
    const heightScale = ctx.canvas.height * map.backgroundParalax.y / image.height;
    const maxScale = Math.max(widthScale, heightScale);

    // determine positioning
    const camPosNormalized = createVector(
        (camera.positionData.position.x - camera.halfWidth) / (map.width - 2 * camera.halfWidth),
        (camera.positionData.position.y - camera.halfHeight) / (map.height - 2 * camera.halfHeight)
    );
    const imageSize = createVector(
        image.width * widthScale,
        image.height * heightScale
    );
    const imageMaxScaleSize = createVector(
        image.width * maxScale,
        image.height * maxScale
    );
    const padding = scale(0.5, subtract(imageMaxScaleSize, imageSize));
    const x = padding.x + camPosNormalized.x * (imageSize.x - ctx.canvas.width);
    const y = padding.y + camPosNormalized.y * (imageSize.y - ctx.canvas.height);

    ctx.drawImage(image, -x, -y, imageMaxScaleSize.x, imageMaxScaleSize.y);
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
