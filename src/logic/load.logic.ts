import { IMapSchema, getEntityJsonData } from "../assets/json/jsonSchemas";
import { createSetLoadingFlagAction } from "../actions/loading.action";
import { put } from "redux-saga/effects";
import { IMap } from "../model/map.model";
import { createSetMapAction } from "../actions/map.actions";

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
    map.entities.forEach((entity) => {
        let entityData = getEntityJsonData(entity.type);
        if (!isImageAlreadyLoaded(entityData.spritesheet)) {
            uniqueImages.add(entityData.spritesheet);
        }
    });

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
 * Generator function for handling level loading, including loading all assets needed for the given level.
 * @param levelFile 
 */
export function* loadLevelSaga(levelFile: string) {
    // indicate that we are loading
    yield put(createSetLoadingFlagAction(true));

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
    const imagesToLoad = 
    promise = lazyLoadImages(getImagesToLoad(data));
    yield promise;

    // indicate that loading has finished
    yield put(createSetLoadingFlagAction(false));
}
