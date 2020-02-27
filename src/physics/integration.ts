import { IEntity } from "../redux/state";
import { IVector, add, scale, zeroVector } from "../utils/geometry";

export function integrateEntity(t: number, entity: IEntity, externalForces: IVector) {
    // integrate
    entity.velocity = add(entity.velocity, scale(t, externalForces));
    entity.prevPosition = entity.position;
    entity.position = add(entity.position, scale(t, add(entity.velocity, entity.impulse)));

    // clear impulse
    entity.impulse = zeroVector();
}
