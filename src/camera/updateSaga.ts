import { IVector, cloneVector } from "../utils/geometry";
import { select, put } from "redux-saga/effects";
import { getCamera, getMap } from "../redux/selectors";
import { actionCameraSetPosition } from "../redux/actionCreators";
import { ICamera, IMap } from "../redux/state";

export function* updateCamera(targetPosition: IVector) {
    // get camera
    let camera: ICamera = yield select(getCamera);
    let camPosition = camera.position;

    // move camera
    const map: IMap = yield select(getMap);
    if (!camera.lockX) {
        camPosition.x = targetPosition.x - camera.width / 2;
        camPosition.x = Math.max(camPosition.x, 0);
        camPosition.x = Math.min(camPosition.x, map.width - camera.width);

    }
    if (!camera.lockY) {
        camPosition.y = targetPosition.y - camera.height / 2;
        camPosition.y = Math.max(camPosition.y, 0);
        camPosition.y = Math.min(camPosition.y, map.height - camera.height);
    }

    // set updated camera
    yield put(actionCameraSetPosition(camPosition));
}
