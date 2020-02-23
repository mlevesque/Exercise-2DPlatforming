import { IMainState } from "../model/IMainState";
import { select } from "redux-saga/effects";
import { getFullState } from "./selectors";
import { IMap } from "../model/map.model";
import { getGameConfig } from "../assets/json/jsonSchemas";

function getImage(imageName: string): HTMLImageElement {
    return document.getElementById(imageName) as HTMLImageElement;
}

function renderLoading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

function renderTiles(ctx: CanvasRenderingContext2D, map: IMap): void {
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

function render(ctx: CanvasRenderingContext2D, width: number, height: number, state: IMainState): void {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);

    renderTiles(ctx, state.map);
}

export function* renderSaga() {
    const canvas = <HTMLCanvasElement>document.getElementById("gameView");
    const ctx = canvas.getContext("2d");
    const state: IMainState = yield select(getFullState);

    if (state.loading) {
        renderLoading(ctx, canvas.width, canvas.height);
    }
    else {
        render(ctx, canvas.width, canvas.height, state);
    }
}
