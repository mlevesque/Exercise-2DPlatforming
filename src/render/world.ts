import { IMap } from "../redux/state";
import { getImage } from "./utils";
import { getGameConfig } from "../utils/jsonSchemas";
import { createVector, subtract, scale } from "../utils/geometry";
import { CameraManager } from "../camera/CameraManager";

export function renderBackground(ctx: CanvasRenderingContext2D, map: IMap): void {
    const image = getImage(map.background);
    if (!image) {
        return;
    }

    // determine the size of the background
    const widthScale = ctx.canvas.width * map.backgroundParalax.x / image.width;
    const heightScale = ctx.canvas.height * map.backgroundParalax.y / image.height;
    const maxScale = Math.max(widthScale, heightScale);

    // determine positioning
    const camera = CameraManager.getInstance().activeCamera;
    const camPosNormalized = createVector(
        (camera.movementData.position.x - camera.config.halfWidth) / (map.width - 2 * camera.config.halfWidth),
        (camera.movementData.position.y - camera.config.halfHeight) / (map.height - 2 * camera.config.halfHeight)
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

    const camera = CameraManager.getInstance().activeCamera;
    const config = getGameConfig();
    const size = config.tileSize;
    const camPos = camera.movementData.position;
    const x1 = Math.max(0, Math.floor((camPos.x - camera.config.halfWidth) / size));
    const x2 = Math.min(Math.ceil(map.width / size), Math.ceil((camPos.x + camera.config.halfWidth) / size));
    const y1 = Math.max(0, Math.floor((camPos.y - camera.config.halfHeight) / size));
    const y2 = Math.min(Math.ceil(map.height / size), Math.ceil((camPos.y + camera.config.halfHeight) / size));
    for (let indexY = y1; indexY < y2; ++indexY) {
        let y = indexY * size;
        for (let indexX = x1; indexX < x2; ++indexX) {
            const value = map.tiles[indexY][indexX];
            let tileX = (value % 16) * size;
            let tileY = Math.floor(value / 16) * size;
            let x = indexX * size;
            ctx.drawImage(image, tileX, tileY, size, size, x, y, size, size);
        }
    }
}
