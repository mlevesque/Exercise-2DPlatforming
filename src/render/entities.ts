import { IEntity } from "../redux/state";

export function renderEntity(ctx: CanvasRenderingContext2D, entity: IEntity): void {
    const spriteSheet = document.getElementById(entity.spriteAnimation.spritesheet) as HTMLImageElement;
    const slice = entity.spriteAnimation.getSpriteSlice();
    ctx.save();
    ctx.translate(
        Math.floor(entity.movementData.position.x),
        Math.floor(entity.movementData.position.y)
    );
    ctx.scale(entity.spriteAnimation.isFlipped ? -1 : 1, 1);
    ctx.drawImage(
        spriteSheet,     // image source
        slice.x,         // source x
        slice.y,         // source y
        slice.w,         // source width
        slice.h,         // source height
        -slice.offX,     // destination x
        -slice.offY,     // destination y
        slice.w,         // destination width
        slice.h          // destination height
    );
    ctx.restore();
}
