import { IEntity } from "../model/entity.model";

export function copyEntity(entity: IEntity): IEntity {
    let newEntity: IEntity = Object.assign({}, entity);
    newEntity.position = Object.assign({}, entity.position);
    return newEntity;
}
