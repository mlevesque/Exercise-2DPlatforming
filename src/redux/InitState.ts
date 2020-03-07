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
        width: 640,
        height: 480,
        position: {x: 0, y: 0},
        lockX: false,
        lockY: false,
    },
    map: null,
    staticCollisions: {},
    entities: []
}
