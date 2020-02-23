import { IInputActions } from "./input.model";
import { ICamera } from "./camera.model";

export interface IMainState {
    input: IInputActions;
    camera: ICamera;
}
