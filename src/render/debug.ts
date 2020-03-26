import { IVector, zeroVector, scale, createVector, add, subtract, vectorSquaredLength, areAreasIntersecting } 
    from "../utils/geometry";
import { ICollisionSegment } from "../physics/collisions/CollisionSegment";
import { IEntity, ICamera, IMap } from "../redux/state";
import { IEntitySchema, getEntityJsonData } from "../utils/jsonSchemas";
import { isWall } from "../physics/util";
import { WorldPartition } from "../physics/collections/WorldPartition";
import { getAreaFromCamera } from "../utils/misc";
import { getCameraArea } from "../camera/utils";

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

function renderSegment(ctx: CanvasRenderingContext2D, segment: ICollisionSegment, isHighlight: boolean): void {
    ctx.save();
    ctx.translate(segment.segment.p.x, segment.segment.p.y);

    // render segment
    let color = isHighlight ? "yellow" : (isWall(segment) ? "blue" : "red");
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = isHighlight ? 3 : 2;
    renderArrow(ctx, zeroVector(), segment.segment.v, isHighlight ? 7 : 5);

    // render normal
    ctx.fillStyle = "green";
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    renderArrow(ctx, zeroVector(), scale(20, segment.normal), 5);

    // render ledges
    ctx.fillStyle = "yellow";
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 1;
    let direction = segment.segment.v.x > 0 ? -10 : 10;
    if (segment.startLedge) {
        renderArrow(ctx, zeroVector(), createVector(direction, 0), 3);
    }
    if (segment.endLedge) {
        renderArrow(ctx, segment.segment.v, add(createVector(-direction, 0), segment.segment.v), 3);
    }
    ctx.restore();
}

export function renderMapCollisions(ctx: CanvasRenderingContext2D, camera: ICamera, highlightSegId: string): void {
    const collisions = WorldPartition.getInstance().getCollisionsInWorldArea(getAreaFromCamera(camera));
    collisions.forEach((segment) => {
        renderSegment(ctx, segment, segment.id === highlightSegId);
    })
}

export function renderEntityCollisions(ctx: CanvasRenderingContext2D, entity: IEntity): void {
    const entityData: IEntitySchema = getEntityJsonData(entity.type);
    let collision = entityData.collision;

    ctx.save();
    ctx.translate(
        entity.positionData.position.x,
        entity.positionData.position.y
    );
    ctx.scale(entity.spriteAnimation.isFlipped ? -1 : 1, 1);

    // draw floor point
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(collision.floorPoint.x, collision.floorPoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // draw ceiling point
    ctx.beginPath();
    ctx.arc(collision.ceilingPoint.x, collision.ceilingPoint.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // draw collision sides
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(collision.halfWidth, collision.ceilingPoint.y);
    ctx.lineTo(collision.halfWidth, collision.floorPoint.y);
    ctx.moveTo(-collision.halfWidth, collision.ceilingPoint.y);
    ctx.lineTo(-collision.halfWidth, collision.floorPoint.y);
    ctx.stroke();

    ctx.restore();
}

export function renderPartitionCellSegmentHighlight(
                        ctx: CanvasRenderingContext2D, camera: ICamera, map: IMap, segment: ICollisionSegment): void {
    ctx.fillStyle = "red";
    ctx.globalAlpha = 0.5;

    const partition = WorldPartition.getInstance();
    const positions = partition.getCellsTouchingSegment(segment);
    const camArea = getCameraArea(camera);
    positions.forEach((pos) => {
        const cellArea = partition.getWorldAreaOfCell(pos);
        if (areAreasIntersecting(camArea, cellArea)) {
            ctx.fillRect(cellArea.minX, cellArea.minY, cellArea.maxX - cellArea.minX, cellArea.maxY - cellArea.minY);
        }
    });

    ctx.globalAlpha = 1;
}

export function renderPartition(ctx: CanvasRenderingContext2D, camera: ICamera, map: IMap): void {
    const partition = WorldPartition.getInstance();
    const width = map.width;
    const height = map.height;

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;

    const camPos = camera.positionData.position;
    const start = createVector(
        Math.max(0, Math.floor((camPos.x - camera.halfWidth) / partition.cellWidth)),
        Math.max(0, Math.floor((camPos.y - camera.halfHeight) / partition.cellHeight))
    );
    const end = createVector(
        Math.min(partition.numColumns, Math.ceil((camPos.x + camera.halfWidth) / partition.cellWidth)),
        Math.min(partition.numRows, Math.ceil((camPos.y + camera.halfHeight) / partition.cellHeight))
    );

    // draw rows
    for (let i = start.y; i < end.y; ++i) {
        const y = i * partition.cellHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // draw columns
    for (let i = start.x; i < end.x; ++i) {
        const x = i * partition.cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
}

export function renderWorldEdge(ctx: CanvasRenderingContext2D, map: IMap): void {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(0, 0, map.width, map.height);
    ctx.stroke();
}

export function renderScrollVector(ctx: CanvasRenderingContext2D, camera: ICamera, targetPos: IVector): void {
    const v = subtract(targetPos, camera.positionData.position);
    const m = vectorSquaredLength(v);
    const r = camera.scrollArea.radius;
    const lineColor = m > r*r+1 ? "red" : "blue";
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = lineColor;
    ctx.lineWidth = 3;
    renderArrow(ctx, camera.positionData.position, targetPos, 5);
}

export function renderScrollArea(ctx: CanvasRenderingContext2D, camera: ICamera): void {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(
        camera.halfWidth, 
        camera.halfHeight, 
        camera.scrollArea.radius, 
        camera.scrollArea.radius, 
        0, 
        0, 
        2 * Math.PI
    );
    ctx.stroke();
}

export function renderFrameRate(ctx: CanvasRenderingContext2D, deltaT: number): void {
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText((1000/deltaT).toFixed(0), ctx.canvas.width - 30, 16);
}
