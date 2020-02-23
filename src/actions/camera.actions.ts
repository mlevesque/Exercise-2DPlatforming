import { AnyAction } from "redux";

export enum CameraAction {
    Resize = "CAMERA_RESIZE",
}

export function createCameraResizeAction(width: number, height: number): AnyAction {
    return { type: CameraAction.Resize, payload: {width: width, height: height} };
}
