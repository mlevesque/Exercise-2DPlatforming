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
        position: {x: 0, y: 0},
        lockX: false,
        lockY: false,
        innerScrollArea: {
            verticalRadius: 100,
            horizontalRadius: 150,
        },
        outerScrollArea: {
            verticalRadius: 200,
            horizontalRadius: 300,
        }
    },
    map: null,
    staticCollisions: {},
    entities: []
}
