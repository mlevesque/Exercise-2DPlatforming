import { getGameConfig } from "../utils/jsonSchemas";
import { IVector, cloneVector } from "../utils/geometry";
import { IEntity } from "../redux/state";
import { integrateEntity } from "./integration";
import { ICollisionSegment } from "./CollisionSegment";
import { select } from "redux-saga/effects";
import { getStaticCollisions } from "../redux/selectors";
import { updateWorldCollisionsOnEntity } from "./worldCollisions";

export function* updateMovementSaga(deltaT: number, entities: IEntity[]) {
    let config = getGameConfig();
    let externalForces: IVector = cloneVector(config.gravity);
    let t = deltaT / 1000;

    entities.forEach((entity) => {
        integrateEntity(t, entity, externalForces);
    });
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    let staticCollisions: ICollisionSegment[] = yield select(getStaticCollisions);
    entities.forEach((entity) => updateWorldCollisionsOnEntity(entity, staticCollisions));
}
