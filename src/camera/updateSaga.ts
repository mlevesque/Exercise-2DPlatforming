import { ICamera, ICameraConfig } from "./Camera";
import { IVector, IArea, createVector } from "../utils/geometry";
import { CameraManager } from "./CameraManager";
import { getMap, getCameraConfig } from "../redux/selectors";
import { select } from "redux-saga/effects";
import { IMap } from "../redux/state";
import { IEntity } from "../entities/IEntity";
import { EntityCollection } from "../entities/EntityCollection";

/**
 * Updates the camera position.
 * @param deltaT 
 */
export function* updateCamera(deltaT: number) {
    const camera: ICamera = CameraManager.getInstance().activeCamera;
    const map: IMap = yield select(getMap);
    const area: IArea = {
        minX: 0,
        minY: 0,
        maxX: map.width,
        maxY: map.height
    };
    const cameraConfig: ICameraConfig = yield select(getCameraConfig);
    const targetEntity: IEntity = EntityCollection.getInstance().getEntity(cameraConfig.entityTarget);
    const targetPos = targetEntity ? targetEntity.movement.position : createVector(map.width / 2, map.height / 2);
    camera.setConfig(cameraConfig);
    camera.update(deltaT, targetPos, area);
}
