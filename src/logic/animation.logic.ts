import { IEntity } from "../model/entity.model";
import { getEntityJsonData, IAnimationSchema } from "../assets/json/jsonSchemas";

function isLastFrameIndex(index: number, animation: IAnimationSchema) {
    return index == animation.slices.length - 1;
}

function shouldChangeAnimationFrame(elapsedTime: number, frameIndex: number, animation: IAnimationSchema): boolean {
    return elapsedTime > animation.slices[frameIndex].t
            && (animation.loops || (isLastFrameIndex(frameIndex, animation) && !animation.loops));
}

function updateSpriteAnimationOnEntity(deltaT: number, entity: IEntity): void {
    // get data on entity
    const entityData = getEntityJsonData(entity.type);
    const animation = entityData.animations[entity.currentAnimation];

    // do nothing if there is no animation data
    if (!animation) {
        return;
    }

    // determine which animation frame we shoudl not be on
    let elapsedTime = entity.elapsedTime + deltaT;
    let frameIndex = entity.currentFrame;
    let slice = animation.slices[frameIndex];
    while (shouldChangeAnimationFrame(elapsedTime, frameIndex, animation)) {
        elapsedTime -= slice.t;
        frameIndex++;
        if (frameIndex >= animation.slices.length) {
            frameIndex = animation.loops ? 0 : animation.slices.length - 1;
        }
        slice = animation.slices[frameIndex];
    }
    entity.elapsedTime = elapsedTime;
    entity.currentFrame = frameIndex;
}

export function* updateAnimations(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity: IEntity) => updateSpriteAnimationOnEntity(deltaT, entity));
}
