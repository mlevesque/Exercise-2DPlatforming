import { IEntity, EntityAnimation } from "../model/entity.model";
import { getEntityJsonData, IAnimationSchema } from "../assets/json/jsonSchemas";
import { isUndefined } from "util";

function getFrameTimeInterval(frameIndex: number, animation: IAnimationSchema): number {
    let result = animation.intervals[frameIndex];
    return isUndefined(result) ? 1 : result;
}

function isLastFrameIndex(index: number, animation: IAnimationSchema) {
    return index == animation.frameCount - 1;
}

function shouldChangeAnimationFrame(elapsedTime: number, frameIndex: number, animation: IAnimationSchema): boolean {
    return elapsedTime > animation.intervals[frameIndex]
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

    // determine which animation frame we should be on
    let elapsedTime = entity.elapsedTime + deltaT;
    let frameIndex = entity.currentFrame;
    while (shouldChangeAnimationFrame(elapsedTime, frameIndex, animation)) {
        elapsedTime -= getFrameTimeInterval(frameIndex, animation);;
        frameIndex++;
        if (frameIndex >= animation.frameCount) {
            frameIndex = animation.loops ? 0 : animation.frameCount - 1;
        }
    }
    entity.elapsedTime = elapsedTime;
    entity.currentFrame = frameIndex;
}

export function* updateAnimations(deltaT: number, entities: IEntity[]) {
    entities.forEach((entity: IEntity) => updateSpriteAnimationOnEntity(deltaT, entity));
}

export function changeAnimationOnEntity(entity: IEntity, animationType: EntityAnimation, reset: boolean = false): void {
    if (entity.currentAnimation != animationType || reset) {
        entity.currentAnimation = animationType;
        entity.elapsedTime = 0;
        entity.currentFrame = 0;
    }
}
