import { IMainState } from "../model/IMainState";
import { InputType } from "../model/input.model";

export const InitState: IMainState = {
    input: {
        [InputType.Left]: {previous: false, current: false},
        [InputType.Right]: {previous: false, current: false},
        [InputType.Jump]: {previous: false, current: false},
    },
}
