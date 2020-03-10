import { IEntity } from "../redux/state";
import { IEntitySchema, getEntityJsonData } from "../utils/jsonSchemas";

export function renderEntity(ctx: CanvasRenderingContext2D, entity: IEntity): void {
    let entityData: IEntitySchema = getEntityJsonData(entity.type);
    let spriteSheet: HTMLImageElement = document.getElementById(entityData.spritesheet) as HTMLImageElement;
    let animation = entityData.animations[entity.currentAnimation];
    ctx.save();
    ctx.translate(
        Math.floor(entity.positionData.position.x),
        Math.floor(entity.positionData.position.y)
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
    ctx.restore();
}
