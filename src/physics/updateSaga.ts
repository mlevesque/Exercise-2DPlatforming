import { getGameConfig } from "../utils/jsonSchemas";
import { IVector, cloneVector } from "../utils/geometry";
import { IEntity } from "../redux/state";
import { integratePositionData, EulerIntegration, VerletIntegration } from "./integration";
import { updateWorldCollisionsOnEntity } from "./worldCollisionChecks";

export function* updateMovementSaga(deltaT: number, entities: IEntity[]) {
    let config = getGameConfig();
    let externalForces: IVector = cloneVector(config.gravity);

    entities.forEach((entity) => {
        integratePositionData(deltaT, entity.positionData, EulerIntegration, externalForces);
    });
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity) => updateWorldCollisionsOnEntity(entity));
}
