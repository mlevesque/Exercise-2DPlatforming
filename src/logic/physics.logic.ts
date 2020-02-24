import { IEntity } from "../model/entity.model";
import { IVector, add, scale, cloneVector, zeroVector } from "../model/geometry.model";
import { getGameConfig } from "../assets/json/jsonSchemas";

export function integrateEntityPositioning(t: number, entity: IEntity, externalForces: IVector) {
    // integrate
    entity.velocity = add(entity.velocity, scale(t, externalForces));
    entity.prevPosition = entity.position;
    entity.position = add(entity.position, scale(t, add(entity.velocity, entity.impulse)));

    // clear impulse
    entity.impulse = zeroVector();
}

export function* updatePhysicsSaga(deltaT: number, player: IEntity, entities: IEntity[]) {
    let config = getGameConfig();
    let externalForces: IVector = cloneVector(config.gravity);
    let t = deltaT / 1000;

    integrateEntityPositioning(t, player, externalForces);
    entities.forEach((entity) => {
        integrateEntityPositioning(t, entity, externalForces);
    });
}
