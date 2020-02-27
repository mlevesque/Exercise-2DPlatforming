import { IEntity } from "../redux/state";
import { updateSpriteAnimationOnEntity } from "./utils";

export function* updateAnimations(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity: IEntity) => updateSpriteAnimationOnEntity(deltaT, entity));
}
