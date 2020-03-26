import { ICamera, ICameraConfig } from "./Camera";
import { IVector, IArea } from "../utils/geometry";
import { CameraManager } from "./CameraManager";
import { getMap, getCameraConfig } from "../redux/selectors";
import { select } from "redux-saga/effects";
import { IMap } from "../redux/state";

/**
 * Updates the camera position, scrolling towards the given target position.
 * @param deltaT 
 * @param targetPosition 
 */
export function* updateCamera(deltaT: number, targetPosition: IVector) {
    const camera: ICamera = CameraManager.getInstance().activeCamera;
    const map: IMap = yield select(getMap);
    const area: IArea = {
        minX: 0,
        minY: 0,
        maxX: map.width,
        maxY: map.height
    };
    const cameraConfig: ICameraConfig = yield select(getCameraConfig);
    camera.setConfig(cameraConfig);
    camera.update(deltaT, targetPosition, area);
}
