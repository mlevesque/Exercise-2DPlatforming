import { AnyAction } from "redux";
import { PhysicsConfigAction } from "../redux/actionTypes";
import { IMap } from "../redux/state";
import { getMap, getLevelName } from "../redux/selectors";
import { select, put, takeEvery, all } from "redux-saga/effects";
import { WorldPartition } from "../physics/collections/WorldPartition";
import { ICollisionSegment } from "../physics/collisions/ICollisionSegment";
import { getGameConfig, IMapSchema } from "../utils/jsonSchemas";
import { loadLevelData } from "./utils";
import { actionSetGravity } from "../redux/actionCreators";
import { CollisionCollections } from "../physics/collections/CollisionCollections";

function* resetPartition(action: AnyAction) {
    // determine the new cell size
    const width = action.payload.width;
    const height = action.payload.height;
    const partition = WorldPartition.getInstance();
    const map: IMap = yield select(getMap);
    partition.setupPartition(map.width, map.height, width, height);

    // repopulate
    const segmentCollisions = CollisionCollections.getInstance().getAllStaticCollisionSegments();
    segmentCollisions.forEach((segment: ICollisionSegment) => {
        partition.addStaticCollision(segment);
    });
}

function* resetGravity() {
    const config = getGameConfig();
    const levelName = yield select(getLevelName);
    const promise = loadLevelData(levelName);
    const data: IMapSchema = (yield promise) as IMapSchema;
    const gravity = data.gravity ? data.gravity : config.gravity;
    yield put(actionSetGravity(gravity));
}

export function* resetSagas() {
    yield all([
        takeEvery(PhysicsConfigAction.SetPartitionCellSize, resetPartition),
        takeEvery(PhysicsConfigAction.ResetGravity, resetGravity),
    ]);
}
