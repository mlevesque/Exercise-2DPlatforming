import { getGameConfig } from "../utils/jsonSchemas";
import { IVector, cloneVector } from "../utils/geometry";
import { IEntity } from "../redux/state";
import { integrateEntity } from "./integration";
import { updateWorldCollisionsOnEntity } from "./worldCollisionChecks";

export function* updateMovementSaga(deltaT: number, entities: IEntity[]) {
    let config = getGameConfig();
    let externalForces: IVector = cloneVector(config.gravity);
    let t = deltaT / 1000;

    entities.forEach((entity) => {
        integrateEntity(t, entity, externalForces);
    });
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity) => updateWorldCollisionsOnEntity(entity));
}
