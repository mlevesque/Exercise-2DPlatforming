import { IMainState } from "../model/IMainState";
import { InputType } from "../model/input.model";
import { EntityType, EntityAnimation } from "../model/entity.model";

export const InitState: IMainState = {
    loading: false,
    input: {
        [InputType.Left]: {previous: false, current: false},
        [InputType.Right]: {previous: false, current: false},
        [InputType.Jump]: {previous: false, current: false},
    },
    camera: {
        width: 640,
        height: 480,
    },
    map: null,
    entities: [
        {
            type: EntityType.Player,
            currentAnimation: EntityAnimation.Walk,
            currentFrame: 0,
            elapsedTime: 0,
            position: {
                x: 200,
                y: 100
            }
        }
    ],
}
