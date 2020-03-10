import { put, select } from "redux-saga/effects";
import { actionSetLoadingFlag, actionClearMap, actionClearEntities, actionSetMap, actionSetStaticCollisions, 
    actionSetEntitiesCollection, actionCameraSetLocks, actionCameraSetPosition } from "../redux/actionCreators";
import { IMapSchema, getGameConfig } from "../utils/jsonSchemas";
import { IMap, ICamera } from "../redux/state";
import { lazyLoadImages, getImagesToLoad, buildEntityCollection, setupCamera} from "./utils";
import { getCamera } from "../redux/selectors";
import { buildWorldPartition, buildCollisionsCollection } from "./collisionBuilding";

/**
 * Generator function for handling level loading, including loading all assets needed for the given level.
 * @param levelFile 
 */
export function* loadLevelSaga(levelFile: string) {
    // indicate that we are loading
    yield put(actionSetLoadingFlag(true));

    // clear old level data
    yield put(actionClearMap());
    yield put(actionClearEntities());

    // load map data
    let promise = import(
        /* WebpackMode: "lazy" */
        `../assets/json/${levelFile}`
    )
    let data: IMapSchema = (yield promise) as IMapSchema;

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
