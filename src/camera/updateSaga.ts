import { IVector, cloneVector } from "../utils/geometry";
import { select, put } from "redux-saga/effects";
import { getCamera } from "../redux/selectors";
import { actionCameraSetPosition } from "../redux/actionCreators";
import { ICamera } from "../redux/state";

export function* updateCamera(targetPosition: IVector) {
    // get camera
    let camera: ICamera = yield select(getCamera);
    let camPosition = cloneVector(camera.position);

    camPosition.x = targetPosition.x - camera.width / 2;
    camPosition.y = targetPosition.y - camera.height / 2;

    // set updated camera
    yield put(actionCameraSetPosition(camPosition));
}
