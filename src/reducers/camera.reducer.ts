import { ICamera } from "../model/camera.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { CameraAction } from "../actions/camera.actions";

export function cameraReducer(state: ICamera = InitState.camera, action: AnyAction): ICamera {
    let newState: ICamera;
    switch (action.type) {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // CAMERA RESIZE
        case CameraAction.Resize:
            newState = Object.assign({}, state);
            newState.width = action.payload.width;
            newState.height = action.payload.height;
            return newState;
    }
    return state;
}
