import { IEntity } from "../../model/entity.model";
import { IVector, subtract, dot, IRay, createRay, cross, negate, add, position, zeroVector } from "../../model/geometry.model";
import { ICollisionSegment } from "../../model/collisions.model";
import { getStaticCollisions } from "../selectors";
import { select } from "redux-saga/effects";
import { getEntityJsonData } from "../../assets/json/jsonSchemas";

/*
    NOTES

    - Calculate movement vector of entity from previous position to new position.
    - Disregard all collision segments whose normal direction is opposite of movement direction.
        - Use dot product on normal and movement direction and disregard if result >= 0
    - Disregard all collision segments whose segment is parallel to movement direction, including collinear
        - The above dot product conveniently takes care of that for us
    - Collision occurs if segments intersect.
        - Calculate t values along both segments
            t1 = cross((p2 - p1), v2) / cross(v1, v2)
            t2 = cross((p1 - p2), v1) / cross(v2, v1)
            where p1 and v1 describe movement direction
                  p2 and v2 describe segment
                  t1 is the t value along the movement direction
                  t2 is the t value along the segment
            collision occurs when 0 <= t1 <= 1 and 0 <= t2 <= 1
        - Store t value of movement direction
    - With each collision, we only care about the smallest t value along the movement direction
    - Resolve by calculating p1 + t1 * v1
*/

function buildMovementChange(entity: IEntity, refPoint: IVector): IRay {
    const dist = subtract(entity.prevPosition, entity.position);
    const pos = add(entity.prevPosition, refPoint);
    return createRay(pos.x, pos.y, dist.x, dist.y);
}

function shouldConsiderSegment(movementRay: IRay, segment: ICollisionSegment): boolean {
    return dot(movementRay.v, segment.normal) >= 0;
}

function getTValues(movementRay: IRay, segmentRay: IRay): [number, number] {
    const pDist = subtract(segmentRay.p, movementRay.p);
    const vCross = cross(movementRay.v, segmentRay.v);
    return [
        cross(pDist, segmentRay.v) / vCross,
        -cross(negate(pDist), movementRay.v) / vCross
    ];
}

function isTValueInRange(t: number): boolean {
    return t >= 0 && t <= 1;
}

function checkPointCollision(movementRay: IRay, segment: ICollisionSegment): number {
    let result: number = NaN;
    if (shouldConsiderSegment(movementRay, segment)) {
        const tValues = getTValues(movementRay, segment.segment);
        if (isTValueInRange(tValues[0]) && isTValueInRange(tValues[1])) {
            result = tValues[0];
        }
    }
    return result;
}

function updateEntity(deltaT: number, entity: IEntity, staticCollisions: ICollisionSegment[]): void {
    const entityData = getEntityJsonData(entity.type);
    const movementRay = buildMovementChange(entity, entityData.collision.floorPoint as IVector);
    let bestT:number = 2;
    staticCollisions.forEach((segment) => {
        const collisionT = checkPointCollision(movementRay, segment);
        bestT = (!isNaN(collisionT) && collisionT < bestT) ? collisionT : bestT;
    });
    if (bestT <= 1) {
        entity.position = {
            x: entity.position.x,
            y: subtract(position(movementRay, bestT), entityData.collision.floorPoint as IVector).y
        }
        entity.velocity = zeroVector();
    }
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    let staticCollisions: ICollisionSegment[] = yield select(getStaticCollisions);
    entities.forEach((entity) => updateEntity(deltaT, entity, staticCollisions));
}
