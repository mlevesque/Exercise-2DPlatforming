import { IVector, zeroVector, scale } from "../utils/geometry";
import { ICollisionSegment } from "../physics/CollisionSegment";
import { IEntity } from "../redux/state";
import { IEntitySchema, getEntityJsonData } from "../utils/jsonSchemas";

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

export function renderMapCollisions(ctx: CanvasRenderingContext2D, collisions: ICollisionSegment[]): void {
    collisions.forEach((segment) => {
        renderSegment(ctx, segment);
    })
}

export function renderEntityCollisions(ctx: CanvasRenderingContext2D, entity: IEntity): void {
    const entityData: IEntitySchema = getEntityJsonData(entity.type);
    let collision = entityData.collision;

    ctx.save();
    ctx.translate(
        entity.position.x,
        entity.position.y
    );
    ctx.scale(entity.flip ? -1 : 1, 1);

    // draw floor point
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(collision.floorPoint.x, collision.floorPoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // draw ceiling point
    ctx.beginPath();
    ctx.arc(collision.ceilingPoint.x, collision.ceilingPoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

export function renderFrameRate(ctx: CanvasRenderingContext2D, deltaT: number): void {
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText((1000/deltaT).toFixed(0), ctx.canvas.width - 30, 16);
}
