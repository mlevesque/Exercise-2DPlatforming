import { IMainState, IEntity } from "../redux/state";
import { renderTiles, renderBackground } from "./world";
import { renderEntity } from "./entities";
import { renderMapCollisions, renderEntityCollisions, renderFrameRate, renderPartition, renderScrollArea, 
    renderScrollVector } from "./debug";
import { ICollisionSegment } from "../physics/CollisionSegment";

export function renderLoading(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
}

export function render(ctx: CanvasRenderingContext2D, deltaT: number, state: IMainState): void {
    ctx.save();
    renderBackground(ctx, state.map, state.camera);

    const cam = state.camera;
    const posData = cam.positionData;
    ctx.translate(Math.floor(cam.halfWidth - posData.position.x), Math.floor(cam.halfHeight - posData.position.y));

    // render scene
    renderTiles(ctx, state.map);
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity);
    });

    // render debug stuff
    // renderMapCollisions(ctx, new Map<string, ICollisionSegment>(Object.entries(state.staticCollisions)));
    // state.entities.forEach((entity: IEntity) => {
    //     renderEntityCollisions(ctx, entity);
    // });
    // renderPartition(ctx, state.camera, state.map);
    // const player = state.entities.length > 0 ? state.entities[0] : null;
    // if (player) {
    //     renderScrollVector(ctx, state.camera, player.positionData.position);
    // }
    ctx.restore();

    // render HUD stuff
    // renderScrollArea(ctx, state.camera);
    // renderFrameRate(ctx, deltaT);
}
