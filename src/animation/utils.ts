import { IAnimationSchema, getEntityJsonData } from "../utils/jsonSchemas";
import { isUndefined } from "util";
import { IEntity } from "../redux/state";

export function getFrameTimeInterval(frameIndex: number, animation: IAnimationSchema): number {
    let result = animation.intervals[frameIndex];
    return isUndefined(result) ? 1 : result;
}

export function isLastFrameIndex(index: number, animation: IAnimationSchema) {
    return index == animation.frameCount - 1;
}

export function shouldChangeAnimationFrame(elapsedTime: number, frameIndex: number, animation: IAnimationSchema): boolean {
    return elapsedTime > animation.intervals[frameIndex]
            && (animation.loops || (isLastFrameIndex(frameIndex, animation) && !animation.loops));
}

export function updateSpriteAnimationOnEntity(deltaT: number, entity: IEntity): void {
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
