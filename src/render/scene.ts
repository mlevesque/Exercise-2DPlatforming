import { IMainState, IEntity } from "../redux/state";
import { renderTiles, renderBackground } from "./world";
import { renderEntity } from "./entities";
import { renderMapCollisions, renderEntityCollisions, renderFrameRate, renderPartition, renderScrollArea, 
    renderScrollVector, renderPartitionCellSegmentHighlight} from "./debug";
import { CollisionCollections } from "../physics/collections/CollisionCollections";

export function renderLoading(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.textAlign = "center";
    ctx.font = "normal bold 20px sans-serif";
    ctx.fillStyle = "white";
    ctx.fillText("Loading assets...", ctx.canvas.width / 2, ctx.canvas.height / 2);
}

export function render(ctx: CanvasRenderingContext2D, deltaT: number, state: IMainState): void {
    ctx.save();
    renderBackground(ctx, state.map, state.camera);

    const cam = state.camera;
    const posData = cam.positionData;
    ctx.translate(Math.floor(cam.halfWidth - posData.position.x), Math.floor(cam.halfHeight - posData.position.y));

    // render scene
    renderTiles(ctx, state.map, state.camera);
    state.entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity);
    });

    // render partition debug
    if (state.renderConfig.enablePartition) {
        const segment = CollisionCollections.getInstance().getCollisionSegment(state.renderConfig.partitionSegmentId);
        if (segment) {
            renderPartitionCellSegmentHighlight(ctx, state.camera, state.map, segment);
        }
        renderPartition(ctx, state.camera, state.map);
    }

    // render collision segments
    if (state.renderConfig.enableCollisionSegments) {
        renderMapCollisions(ctx, state.camera, state.renderConfig.partitionSegmentId);
    }

    // render entity collisions
    if (state.renderConfig.enableEntityCollisions) {
        state.entities.forEach((entity: IEntity) => {
            renderEntityCollisions(ctx, entity);
        });
    }

    // render camera scroll vector
    if (state.renderConfig.enableCameraScroll) {
        const player = state.entities.length > 0 ? state.entities[0] : null;
        if (player) {
            renderScrollVector(ctx, state.camera, player.positionData.position);
        }
    }
    ctx.restore();

    // render HUD stuff
    if (state.renderConfig.enableCameraScroll) {
        renderScrollArea(ctx, state.camera);
    }
    if (state.renderConfig.enableFrameRate) {
        renderFrameRate(ctx, deltaT);
    }
}
