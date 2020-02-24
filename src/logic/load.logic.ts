import { IMapSchema, getEntityJsonData } from "../assets/json/jsonSchemas";
import { createSetLoadingFlagAction } from "../actions/loading.action";
import { put } from "redux-saga/effects";
import { IMap } from "../model/map.model";
import { createSetMapAction, createClearMapAction } from "../actions/map.actions";
import { IEntity, EntityType, EntityAnimation } from "../model/entity.model";
import { createSetEntitiesCollectionAction, createSetPlayerAction, createClearEntitiesAction } from "../actions/entities.actions";

/**
 * Returns if an image element with the given image name has already been loaded and attached to the page.
 * @param imageName The name of the image file.
 */
function isImageAlreadyLoaded(imageName: string): boolean {
    const element = document.getElementById(imageName);
    return element != null;
}

/**
 * Returns a collection of all unique images referenced in the given map data that have not yet been loaded.
 * @param map The map data reprrsenting a level with tilesets and entity assets.
 */
function getImagesToLoad(map: IMapSchema): string[] {
    let uniqueImages = new Set<string>();

    // get tileset
    if (!isImageAlreadyLoaded(map.tileset)) {
        uniqueImages.add(map.tileset);
    }

    // get entity spritesheets
    let getEntityImage = (type: EntityType) => {
        let entityData = getEntityJsonData(type);
        if (!isImageAlreadyLoaded(entityData.spritesheet)) {
            uniqueImages.add(entityData.spritesheet);
        }
    }
    if (map.player) {
        getEntityImage(EntityType.Player);
    }
    map.entities.forEach((entry) => getEntityImage(entry.type));

    // return results
    return Array.from(uniqueImages.values());
}

/**
 * Performs an asynchronous loading of all given images, attaching them as hidden elements. Returns the generated
 * Promise for the asynchronous action.
 * @param imageNames 
 */
function lazyLoadImages(imageNames: string[]): Promise<any> {
    return Promise.all(
        imageNames.map((name: string) => {
            return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
                import(
                /* webpackMode: "lazy-once" */
                `../assets/images/${name}`
                )
                .then(src => {
                    const img = document.createElement("img");
                    const container = document.getElementsByTagName("BODY")[0];
                    container.appendChild(img);
                    img.onload = (e: Event) => resolve(src.default);
                    img.src = src.default;
                    img.id = name;
                    img.hidden = true;
                })
                .catch(err => reject(err));
            })
        })
    )
}

/**
 * Returns an entity state for the player from the given map schema data.
 * @param map 
 */
function buildPlayer(map: IMapSchema): IEntity {
    if (map && map.player) {
        return {
            type: EntityType.Player,
            flip: map.player.flip,
            currentAnimation: EntityAnimation.Idle,
            currentFrame: 0,
            elapsedTime: 0,
            position: Object.assign({}, map.player.position),
        }
    }
    else {
        return null;
    }
}

/**
 * Builds and returns a list of entity states from the given map schema data.
 * @param map 
 */
function buildEntityCollection(map: IMapSchema): IEntity[] {
    if (map && map.entities) {
        return map.entities.map((entry): IEntity => {
            return {
                type: entry.type,
                flip: false,
                currentAnimation: EntityAnimation.Idle,
                currentFrame: 0,
                elapsedTime: 0,
                position: Object.assign({}, entry.position),
            }
        })
    }
    else {
        return [];
    }
}

/**
 * Generator function for handling level loading, including loading all assets needed for the given level.
 * @param levelFile 
 */
export function* loadLevelSaga(levelFile: string) {
    // indicate that we are loading
    yield put(createSetLoadingFlagAction(true));

    // clear old level data
    yield put(createClearMapAction());
    yield put(createClearEntitiesAction());

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
    yield put(createSetMapAction(map));

    // load images
    promise = lazyLoadImages(getImagesToLoad(data));
    yield promise;

    // populate entities
    let entities = buildEntityCollection(data);
    yield put(createSetEntitiesCollectionAction(entities));

    // populate player
    let player = buildPlayer(data);
    yield put(createSetPlayerAction(player));

    // indicate that loading has finished
    yield put(createSetLoadingFlagAction(false));
}
