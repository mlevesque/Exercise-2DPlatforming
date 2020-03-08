import { IVector, zeroVector, vectorLength, createVector, scale, subtract, add } from "../utils/geometry";
import { select, put } from "redux-saga/effects";
import { getCamera, getMap } from "../redux/selectors";
import { actionCameraSetPosition } from "../redux/actionCreators";
import { ICamera, IMap } from "../redux/state";
import { convertToCameraSpace } from "./util";

function calculateAcceleration(camera: ICamera, targetPosition: IVector): IVector {
    // create vector to target position
    const targetVector = convertToCameraSpace(targetPosition, camera);
    const scrollArea = camera.scrollArea;

    // scale the vector horizontally so that the scroll area is in a space that is a circle
    const scaleVal = scrollArea.verticalRadius / scrollArea.horizontalRadius;
    const transformedV = createVector(targetVector.x * scaleVal, targetVector.y);

    // get magnitude of vector and compare with scroll area radius if it is within radius, then no acceleration
    const magnitude = vectorLength(transformedV);
    if (magnitude <= camera.scrollArea.verticalRadius) {
        return zeroVector();
    }

    // calculate the spring force with dampening
    const springScale = -scrollArea.spring * (magnitude - camera.scrollArea.verticalRadius) / magnitude;
    const springForce = scale(springScale, targetVector);
    const dampenForce = scale(-scrollArea.dampen, camera.velocity);
    return subtract(springForce, dampenForce);
}

export function* updateCamera(deltaT: number, targetPosition: IVector) {
    // get camera
    let camera: ICamera = yield select(getCamera);
    let camPosition = camera.position;
    let camVelocity = camera.velocity;

    // calculate acceleration
    let acceleration: IVector = calculateAcceleration(camera, targetPosition);
    camVelocity = add(camVelocity, scale(deltaT, acceleration));
    camPosition = add(camPosition, scale(deltaT, camVelocity));

    // constrain to world edges
    const map: IMap = yield select(getMap);
    if (!camera.lockX) {
        camPosition.x = Math.max(camPosition.x, camera.halfWidth);
        camPosition.x = Math.min(camPosition.x, map.width - camera.halfWidth);

    }
    if (!camera.lockY) {
        camPosition.y = Math.max(camPosition.y, camera.halfHeight);
        camPosition.y = Math.min(camPosition.y, map.height - camera.halfHeight);
    }

    // set updated camera
    yield put(actionCameraSetPosition(camPosition, camVelocity));
}
