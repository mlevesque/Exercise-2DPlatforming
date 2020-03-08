import { IMainState, InputType } from "./state";

export const InitState: IMainState = {
    loading: false,
    input: {
        [InputType.Left]: {previous: false, current: false},
        [InputType.Right]: {previous: false, current: false},
        [InputType.Jump]: {previous: false, current: false},
        [InputType.Reset]: {previous: false, current: false},
    },
    camera: {
        halfWidth: 320,
        halfHeight: 240,
        velocity: {x: 0, y: 0},
        position: {x: 0, y: 0},
        lockX: false,
        lockY: false,
        scrollArea: {
            verticalRadius: 6,
            horizontalRadius: 8,
            spring: 0.001,
            dampen: 0.0001,
        },
    },
    map: null,
    staticCollisions: {},
    entities: []
}
