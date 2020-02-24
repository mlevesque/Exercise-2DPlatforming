import { IEntity } from "../model/entity.model";
import { IVector, add } from "../model/geometry.model";

export function clearImpulseOnEntity(entity: IEntity): void {
    entity.impulse = {x: 0, y: 0};
}

export function applyImpulseToEntity(entity: IEntity, impulse: IVector): void {
    entity.impulse = add(entity.impulse, impulse);
}
