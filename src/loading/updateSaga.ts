import { put, select } from "redux-saga/effects";
import { actionSetLoadingFlag, actionClearMap, actionClearEntities, actionSetMap, actionSetStaticCollisions, 
    actionSetEntitiesCollection, actionCameraSetLocks, actionCameraSetPosition, actionSetGravity, actionSetLevelName } 
    from "../redux/actionCreators";
import { IMapSchema, getGameConfig } from "../utils/jsonSchemas";
import { IMap, ICamera } from "../redux/state";
import { lazyLoadImages, getImagesToLoad, buildEntityCollection, setupCamera, loadLevelData} from "./utils";
import { getCamera, getLevelName } from "../redux/selectors";
import { buildWorldPartition, buildCollisionsCollection } from "./collisionBuilding";

/**
 * Generator function for handling level loading, including loading all assets needed for the given level.
 * @param levelName
 */
export function* loadLevelSaga(levelName: string) {
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
    let camera: ICamera = yield select(getCamera);
    setupCamera(camera, mapWidth, mapHeight);
    yield put(actionCameraSetLocks(camera.lockX, camera.lockY));
    yield put(actionCameraSetPosition(camera.positionData));

    // build partition
    buildWorldPartition(data);

    // build collisions
    let collisionsMap = buildCollisionsCollection(data);
    yield put(actionSetStaticCollisions(collisionsMap));

    // load images
    promise = lazyLoadImages(getImagesToLoad(data));
    yield promise;

    // populate entities
    let entities = buildEntityCollection(data);
    yield put(actionSetEntitiesCollection(entities));

    // indicate that loading has finished
    yield put(actionSetLoadingFlag(false));
}
