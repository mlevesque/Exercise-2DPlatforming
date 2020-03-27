import { IEntity } from "../entities/IEntity";

export function* updateAnimations(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity: IEntity) => entity.spriteAnimation.update(deltaT));
}
