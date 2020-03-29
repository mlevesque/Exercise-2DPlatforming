import { IMainState } from "../redux/state";
import { renderTiles, renderBackground } from "./world";
import { renderEntity } from "./entities";
import { renderMapCollisions, renderEntityCollisions, renderFrameRate, renderPartition, renderScrollArea, 
    renderScrollVector, renderPartitionCellSegmentHighlight} from "./debug";
import { CollisionCollections } from "../physics/collections/CollisionCollections";
import { EntityCollection } from "../entities/EntityCollection";
import { CameraManager } from "../camera/CameraManager";
import { IEntity } from "../entities/IEntity";

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
    renderBackground(ctx, state.map);

    const cam = CameraManager.getInstance().activeCamera;
    const camPos = cam.movementData.position;
    ctx.translate(Math.floor(cam.config.halfWidth - camPos.x), Math.floor(cam.config.halfHeight - camPos.y));

    // render scene
    renderTiles(ctx, state.map);
    const entityCollection = EntityCollection.getInstance();
    const entities = entityCollection.getAllEntities();
    entities.forEach((entity: IEntity) => {
        renderEntity(ctx, entity);
    });

    // render partition debug
    if (state.renderConfig.enablePartition) {
        const segment = CollisionCollections.getInstance().getCollisionSegment(state.renderConfig.partitionSegmentId);
        if (segment) {
            renderPartitionCellSegmentHighlight(ctx, segment);
        }
        renderPartition(ctx, state.map);
    }

    // render collision segments
    const player = EntityCollection.getInstance().getPlayer();
    if (state.renderConfig.enableCollisionSegments) {
        renderMapCollisions(ctx, state.renderConfig.partitionSegmentId, player.collisions.attachedSegmentId);
    }

    // render entity collisions
    if (state.renderConfig.enableEntityCollisions) {
        entities.forEach((entity: IEntity) => {
            renderEntityCollisions(ctx, entity);
        });
    }

    // render camera scroll vector
    if (state.renderConfig.enableCameraScroll) {
        const player = entityCollection.getPlayer();
        if (player) {
            renderScrollVector(ctx, player.movement.position);
        }
    }
    ctx.restore();

    // render HUD stuff
    if (state.renderConfig.enableCameraScroll) {
        renderScrollArea(ctx);
    }
    if (state.renderConfig.enableFrameRate) {
        renderFrameRate(ctx, deltaT);
    }
}
