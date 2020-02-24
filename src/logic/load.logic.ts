import { IMapSchema, getEntityJsonData, IMapCollisionSchema } from "../assets/json/jsonSchemas";
import { createSetLoadingFlagAction } from "../actions/loading.action";
import { put } from "redux-saga/effects";
import { IMap } from "../model/map.model";
import { createSetMapAction, createClearMapAction } from "../actions/map.actions";
import { IEntity, EntityType, EntityAnimation, buildEntity } from "../model/entity.model";
import { createSetEntitiesCollectionAction, createSetPlayerIdAction, createClearEntitiesAction } from "../actions/entities.actions";
import { ICollisionSegment, createSegment } from "../model/collisions.model";
import { createSetStaticCollisionsAction } from "../actions/collisions.action";

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
 * Builds and returns a collection of collisions from the given map data.
 * @param map 
 */
function buildCollisionsCollection(map: IMapSchema): ICollisionSegment[] {
    if (map && map.collisions) {
        return map.collisions.map((collision: IMapCollisionSchema) => {
            return createSegment({x: collision.x1, y: collision.y1}, {x: collision.x2, y: collision.y2});
        });
    }
    else {
        return [];
    }
}

/**
 * Builds and returns a list of entity states from the given map data.
 * @param map 
 */
function buildEntityCollection(map: IMapSchema): IEntity[] {
    let results: IEntity[] = [];
    if (map && map.player) {
        results.push(buildEntity(EntityType.Player, map.player.flip, EntityAnimation.Idle, map.player.position));
    }
    if (map && map.entities) {
        results = results.concat(map.entities.map((entry): IEntity => {
                return buildEntity(entry.type, false, EntityAnimation.Idle, entry.position);
            })
        );
    }
    return results;
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

    // build collisions
    let collisions = buildCollisionsCollection(data);
    yield put(createSetStaticCollisionsAction(collisions));

    // load images
    promise = lazyLoadImages(getImagesToLoad(data));
    yield promise;

    // populate entities
    let entities = buildEntityCollection(data);
    yield put(createSetEntitiesCollectionAction(entities));
    if (entities.length > 0 && entities[0].type == EntityType.Player) {
        yield put(createSetPlayerIdAction(entities[0].id));
    }

    // indicate that loading has finished
    yield put(createSetLoadingFlagAction(false));
}