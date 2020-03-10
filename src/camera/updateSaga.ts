import { IVector, vectorLength, scale, subtract, createVector, cloneVector } from "../utils/geometry";
import { select, put } from "redux-saga/effects";
import { getCamera, getMap } from "../redux/selectors";
import { actionCameraSetPosition } from "../redux/actionCreators";
import { ICamera, IMap } from "../redux/state";
import { integratePositionData, VerletIntegration, EulerIntegration } from "../physics/integration";
import { setPosition } from "../physics/movementData";

/**
 * Calculates the spring force that drives the camera scrolling.
 * @param camera 
 * @param targetPosition 
 */
function calculateAcceleration(camera: ICamera, targetPosition: IVector): IVector {
    // form vector from camera to target
    const scrollArea = camera.scrollArea;
    const v = subtract(targetPosition, camera.positionData.position);

    // calculate force
    // if the magnitude is within the radius of the area, then don't apply spring force
    const magnitude = vectorLength(v);
    const springK = magnitude <= scrollArea.radius 
        ? 0 
        : scrollArea.spring * (magnitude - scrollArea.radius) / magnitude;
    const springForce = scale(springK, v);
    const dampenForce = scale(scrollArea.dampen, camera.positionData.velocity);
    return subtract(springForce, dampenForce);
}

/**
 * Returns an updated camera psoition based on camera lock flags. This should be called after camera integration
 * calculations.
 * @param camera 
 */
function getPositionFromLocks(camera: ICamera): IVector {
    const posData = camera.positionData;
    return createVector(
        camera.lockX ? posData.previousFramePosition.x : posData.position.x,
        camera.lockY ? posData.previousFramePosition.y : posData.position.y
    );
}

/**
 * Returns an updated position from the given position constrained to the edges of the world if it exceeds those edges.
 * Constraints will only happen if axes are not locked.
 * @param camera 
 * @param camPos 
 * @param map 
 */
function getPositionConstrainedToWorldEdges(camPos: IVector, camera: ICamera, map: IMap): IVector {
    const newPos = cloneVector(camPos);
    if (!camera.lockX) {
        newPos.x = Math.max(newPos.x, camera.halfWidth);
        newPos.x = Math.min(newPos.x, map.width - camera.halfWidth);

    }
    if (!camera.lockY) {
        newPos.y = Math.max(newPos.y, camera.halfHeight);
        newPos.y = Math.min(newPos.y, map.height - camera.halfHeight);
    }
    return newPos;
}

/**
 * Updates the camera position, scrolling towards the given target position.
 * @param deltaT 
 * @param targetPosition 
 */
export function* updateCamera(deltaT: number, targetPosition: IVector) {
    // get camera
    let camera: ICamera = yield select(getCamera);

    // calculate acceleration
    const acceleration: IVector = calculateAcceleration(camera, targetPosition);
    integratePositionData(deltaT, camera.positionData, EulerIntegration, acceleration);

    // adjust position back to previous position in any axis that is locked and constrained to edge of the world
    let newPos = getPositionFromLocks(camera);
    const map: IMap = yield select(getMap);
    newPos = getPositionConstrainedToWorldEdges(newPos, camera, map);
    setPosition(camera.positionData, newPos);

    // set updated camera
    yield put(actionCameraSetPosition(camera.positionData));
}
