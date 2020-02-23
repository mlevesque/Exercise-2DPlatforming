import { IMapSchema } from "../assets/json/jsonSchemas";
import { createSetLoadingFlagAction } from "../actions/loading.action";
import { put } from "redux-saga/effects";
import { IMap } from "../model/map.model";
import { createSetMapAction } from "../actions/map.actions";

function isImageAlreadyLoaded(imageName: string): boolean {
    const element = document.getElementById(imageName);
    return element != null;
}

function getImagesToLoad(map: IMapSchema): string[] {
    let uniqueImages = new Set<string>();

    // get tileset
    if (!isImageAlreadyLoaded(map.tileset)) {
        uniqueImages.add(map.tileset);
    }

    // return results
    return Array.from(uniqueImages.values());
}

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
