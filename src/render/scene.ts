import { IMainState, IEntity } from "../redux/state";
import { renderTiles } from "./world";
import { renderEntity } from "./entities";
import { renderMapCollisions, renderEntityCollisions, renderFrameRate, renderPartition, renderScrollArea } from "./debug";
import { ICollisionSegment } from "../physics/CollisionSegment";

export function renderLoading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

export function render(ctx: CanvasRenderingContext2D, width: number, height: number, deltaT: number, state: IMainState): void {
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const cam = state.camera;
    ctx.translate(Math.floor(cam.halfWidth - cam.position.x), Math.floor(cam.halfHeight - cam.position.y));

    // render scene
    renderTiles(ctx, state.map);
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity);
    });

    // render debug stuff
    renderMapCollisions(ctx, new Map<string, ICollisionSegment>(Object.entries(state.staticCollisions)));
    state.entities.forEach((entity: IEntity) => {
        renderEntityCollisions(ctx, entity);
    });
    renderPartition(ctx);
    ctx.restore();

    // render HUD stuff
    renderScrollArea(ctx, state.camera);
    renderFrameRate(ctx, deltaT);
}
