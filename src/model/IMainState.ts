import { IInputActions } from "./input.model";
import { ICamera } from "./camera.model";
import { IMap } from "./map.model";

export interface IMainState {
    loading: boolean;
    input: IInputActions;
    camera: ICamera;
    map: IMap;
}
