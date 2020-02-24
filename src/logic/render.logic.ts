import { IMainState } from "../model/IMainState";
import { select } from "redux-saga/effects";
import { getFullStateSelector } from "./selectors";
import { IMap } from "../model/map.model";
import { getGameConfig, IEntitySchema, getEntityJsonData } from "../assets/json/jsonSchemas";
import { IEntity } from "../model/entity.model";

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

function renderEntity(ctx: CanvasRenderingContext2D, entity: IEntity, drawCollision: boolean): void {
    let entityData: IEntitySchema = getEntityJsonData(entity.type);
    let spriteSheet: HTMLImageElement = document.getElementById(entityData.spritesheet) as HTMLImageElement;
    let animation = entityData.animations[entity.currentAnimation];
    ctx.save();
    ctx.translate(
        entity.position.x,
        entity.position.y
    );
    ctx.scale(entity.flip ? -1 : 1, 1);
    ctx.drawImage(
        spriteSheet,                                        // image source
        animation.x + entity.currentFrame * animation.w,    // source x
        animation.y,                                        // source y
        animation.w,                                        // source width
        animation.h,                                        // source height
        -animation.offX,                                    // destination x
        -animation.offY,                                    // destination y
        animation.w,                                        // destination width
        animation.h                                         // destination height
    );
    if (drawCollision) {
        let collision = entityData.collision;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(collision.floorPoint.x, collision.floorPoint.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, width: number, height: number, state: IMainState): void {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);

    renderTiles(ctx, state.map);
    if (state.player) {
        renderEntity(ctx, state.player, true);
    }
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity, true);
    });
}

export function* renderSaga() {
    const canvas = <HTMLCanvasElement>document.getElementById("gameView");
    const ctx = canvas.getContext("2d");
    const state: IMainState = yield select(getFullStateSelector);

    if (state.loading) {
        renderLoading(ctx, canvas.width, canvas.height);
    }
    else {
        render(ctx, canvas.width, canvas.height, state);
    }
}
