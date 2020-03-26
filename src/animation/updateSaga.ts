import { IEntity } from "../redux/state";

export function* updateAnimations(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity: IEntity) => entity.spriteAnimation.update(deltaT));
}
