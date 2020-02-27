import { IMap } from "../redux/state";
import { getImage } from "./utils";
import { getGameConfig } from "../utils/jsonSchemas";

export function renderTiles(ctx: CanvasRenderingContext2D, map: IMap): void {
    // get tileset image
    let image = getImage(map.tileset);
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
