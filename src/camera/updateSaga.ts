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
        camPosition.x = targetPosition.x;
        camPosition.x = Math.max(camPosition.x, camera.halfWidth);
        camPosition.x = Math.min(camPosition.x, map.width - camera.halfWidth);

    }
    if (!camera.lockY) {
        camPosition.y = targetPosition.y ;
        camPosition.y = Math.max(camPosition.y, camera.halfHeight);
        camPosition.y = Math.min(camPosition.y, map.height - camera.halfHeight);
    }

    // set updated camera
    yield put(actionCameraSetPosition(camPosition));
}
