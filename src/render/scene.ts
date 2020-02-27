import { IMainState, IEntity } from "../redux/state";
import { renderTiles } from "./world";
import { renderEntity } from "./entities";
import { renderMapCollisions, renderEntityCollisions, renderFrameRate } from "./debug";

export function renderLoading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, deltaT: number, state: IMainState): void {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // render scene
    renderTiles(ctx, state.map);
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity);
    });

    // render debug stuff
    renderMapCollisions(ctx, state.staticCollisions);
    state.entities.forEach((entity: IEntity) => {
        renderEntityCollisions(ctx, entity);
    });
    renderFrameRate(ctx, deltaT);
}
