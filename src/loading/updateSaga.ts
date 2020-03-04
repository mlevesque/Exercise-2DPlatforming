import { put } from "redux-saga/effects";
import { actionSetLoadingFlag, actionClearMap, actionClearEntities, actionSetMap, actionSetStaticCollisions, actionSetEntitiesCollection } from "../redux/actionCreators";
import { IMapSchema } from "../utils/jsonSchemas";
import { IMap } from "../redux/state";
import { buildCollisionsCollection, lazyLoadImages, getImagesToLoad, buildEntityCollection, buildWorldPartition } from "./utils";
import { WorldPartition } from "../physics/WorldPartition";

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
    let map: IMap = {
        tileset: data.tileset,
        tiles: data.map,
    };
    yield put(actionSetMap(map));

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
