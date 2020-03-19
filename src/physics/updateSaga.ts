import { getGameConfig } from "../utils/jsonSchemas";
import { IVector, cloneVector } from "../utils/geometry";
import { IEntity, IPhysicsConfig } from "../redux/state";
import { integratePositionData, EulerIntegration, VerletIntegration } from "./integration";
import { updateWorldCollisionsOnEntity } from "./worldCollisionChecks";
import { getPhysicsConfig } from "../redux/selectors";
import { select } from "redux-saga/effects";

export function* updateMovementSaga(deltaT: number, entities: IEntity[]) {
    const physicsConfig: IPhysicsConfig = yield select(getPhysicsConfig);
    entities.forEach((entity) => {
        integratePositionData(deltaT, entity.positionData, EulerIntegration, physicsConfig.gravity);
    });
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    const physicsConfig = yield select(getPhysicsConfig);
    entities.forEach((entity) => updateWorldCollisionsOnEntity(entity, physicsConfig));
}
