import { IPhysicsConfig } from "../redux/state";
import { EulerIntegration, VerletIntegration } from "./integration/integration";
import { updateWorldCollisionsOnEntity } from "./collisions/worldCollisionChecks";
import { getPhysicsConfig } from "../redux/selectors";
import { select } from "redux-saga/effects";
import { IEntity } from "../entities/IEntity";

export function* updateMovementSaga(deltaT: number, entities: IEntity[]) {
    const physicsConfig: IPhysicsConfig = yield select(getPhysicsConfig);
    entities.forEach((entity) => {
        entity.movement.update(deltaT, EulerIntegration, physicsConfig.gravity);
    });
}

export function* performWorldCollisionsSaga(deltaT: number, entities: IEntity[]) {
    const physicsConfig = yield select(getPhysicsConfig);
    entities.forEach((entity) => updateWorldCollisionsOnEntity(entity, physicsConfig));
}
