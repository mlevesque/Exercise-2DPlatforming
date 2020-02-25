import { IMainState } from "../model/IMainState";
import { select } from "redux-saga/effects";
import { getFullStateSelector } from "./selectors";
import { IMap } from "../model/map.model";
import { getGameConfig, IEntitySchema, getEntityJsonData } from "../assets/json/jsonSchemas";
import { IEntity } from "../model/entity.model";
import { zeroVector, scale, IVector } from "../model/geometry.model";
import { ICollisionSegment } from "../model/collisions.model";

function getImage(imageName: string): HTMLImageElement {
    return document.getElementById(imageName) as HTMLImageElement;
}

function renderLoading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

function renderArrow(ctx: CanvasRenderingContext2D, from: IVector, to: IVector, radius: number): void {
	let x_center = to.x;
	let y_center = to.y;
	let angle;
	let x;
	let y;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    
    ctx.beginPath();
	angle = Math.atan2(to.y - from.y, to.x - from.x)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;
	ctx.moveTo(x, y);
	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius * Math.cos(angle) + x_center;
	y = radius * Math.sin(angle) + y_center;
	ctx.lineTo(x, y);
	angle += (1.0/3.0) * (2 * Math.PI)
	x = radius *Math.cos(angle) + x_center;
	y = radius *Math.sin(angle) + y_center;
	ctx.lineTo(x, y);
	ctx.closePath();
	ctx.fill();
}

function renderSegment(ctx: CanvasRenderingContext2D, segment: ICollisionSegment): void {
    ctx.save();
    ctx.translate(segment.segment.p.x, segment.segment.p.y);

    // render segment
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    renderArrow(ctx, zeroVector(), segment.segment.v, 5);

    // render normal
    ctx.fillStyle = "green";
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    renderArrow(ctx, zeroVector(), scale(20, segment.normal), 5);

    ctx.restore();
}

function renderMapCollisions(ctx: CanvasRenderingContext2D, collisions: ICollisionSegment[]): void {
    collisions.forEach((segment) => {
        renderSegment(ctx, segment);
    })
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

        ctx.beginPath();
        ctx.arc(collision.ceilingPoint.x, collision.ceilingPoint.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}

function render(ctx: CanvasRenderingContext2D, width: number, height: number, state: IMainState): void {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    renderTiles(ctx, state.map);
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity, true);
    });

    renderMapCollisions(ctx, state.staticCollisions);
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
