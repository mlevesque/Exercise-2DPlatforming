import { put, select, takeLatest } from "redux-saga/effects";
import { actionSetLoadingFlag, actionClearMap, actionClearEntities, actionSetMap, actionSetStaticCollisions, 
    actionSetEntitiesCollection, actionCameraSetLocks, actionSetGravity, actionSetLevelName, actionSetPartitionCellSize, actionCameraSetEntityTarget } 
    from "../redux/actionCreators";
import { IMapSchema, getGameConfig } from "../utils/jsonSchemas";
import { IMap, IPhysicsConfig } from "../redux/state";
import { lazyLoadImages, getImagesToLoad, buildEntityCollection, setupCamera, loadLevelData, buildEntityEntriesFromEntityCollection, buildPlayerFromMap} from "./utils";
import { getCameraConfig, getLevelName, getPhysicsConfig } from "../redux/selectors";
import { buildCollisionsCollection } from "./collisionBuilding";
import { GameAction } from "../redux/actionTypes";
import { AnyAction } from "redux";
import { CollisionCollections } from "../physics/collections/CollisionCollections";
import { EntityCollection } from "../entities/EntityCollection";
import { ICameraConfig, buildCamera } from "../camera/Camera";
import { CameraManager } from "../camera/CameraManager";
import { zeroVector } from "../utils/geometry";

/**
 * Generator function for handling level loading, including loading all assets needed for the given level.
 * @param levelName
 */
export function* loadLevelSaga(loadAction: AnyAction) {
    // get level name
    const levelName = loadAction.payload;

    // indicate that we are loading
    yield put(actionSetLoadingFlag(true));

    // get previous level name and determine if we are reloading the level or loading a new level
    const previousLevelName = yield select(getLevelName);
    const isReload = previousLevelName == levelName;

    // set new level name
    yield put(actionSetLevelName(levelName));

    // clear old level data
    yield put(actionClearMap());
    yield put(actionClearEntities());

    // load map data
    let promise = loadLevelData(levelName);
    const data: IMapSchema = (yield promise) as IMapSchema;

    // store map data into store
    const config = getGameConfig();
    const mapHeight = data.map.length * config.tileSize;
    const mapWidth = mapHeight == 0 ? 0 : data.map[0].length * config.tileSize;
    let map: IMap = {
        tileset: data.tileset,
        background: data.background,
        backgroundParalax: data.backgroundParallax,
        tiles: data.map,
        width: mapWidth,
        height: mapHeight
    };
    yield put(actionSetMap(map));

    // set gravity except on reloads
    if (!isReload) {
        const gravity = data.gravity ? data.gravity : config.gravity;
        yield put(actionSetGravity(gravity, true));
    }

    // setup camera
    let cameraConfig: ICameraConfig = yield select(getCameraConfig);
    setupCamera(cameraConfig, mapWidth, mapHeight);
    yield put(actionCameraSetLocks(cameraConfig.lockX, cameraConfig.lockY));

    // build collisions
    const collisions = buildCollisionsCollection(data);
    yield put(actionSetStaticCollisions(collisions.map(seg => seg.id)));
    const collisionCollections = CollisionCollections.getInstance();
    collisionCollections.clearStaticCollisions();
    collisions.forEach(seg => collisionCollections.addStaticCollisionSegment(seg));

    // load images
    promise = lazyLoadImages(getImagesToLoad(data));
    yield promise;

    // populate entities
    const player = buildPlayerFromMap(data);
    const entities = buildEntityCollection(data);
    yield put(actionCameraSetEntityTarget(player ? player.id : ""));
    const entityList = player ? [player, ...entities] : entities;
    yield put(actionSetEntitiesCollection(buildEntityEntriesFromEntityCollection(entityList)));
    const entityCollection = EntityCollection.getInstance();
    entityCollection.clearEntityMap();
    entityList.forEach(entity => entityCollection.addEntity(entity));

    // setup partition
    const physicsConfig: IPhysicsConfig = yield select(getPhysicsConfig);
    yield put(actionSetPartitionCellSize(
        isReload ? physicsConfig.partitionCellWidth : data.partition.cellWidth,
        isReload ? physicsConfig.partitionCellHeight : data.partition.cellHeight));

    // indicate that loading has finished
    yield put(actionSetLoadingFlag(false));
}

export function* loadLevelInitSaga() {
    yield takeLatest(GameAction.Load, loadLevelSaga)
}
