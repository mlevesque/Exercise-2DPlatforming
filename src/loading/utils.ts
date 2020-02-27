import { IMapSchema, getEntityJsonData, IMapCollisionSchema } from "../utils/jsonSchemas";
import { ICollisionSegment, createSegment } from "../physics/CollisionSegment";
import { EntityType, IEntity, EntityAnimation } from "../redux/state";
import { buildEntity } from "../utils/creation";

/**
 * Returns if an image element with the given image name has already been loaded and attached to the page.
 * @param imageName The name of the image file.
 */
export function isImageAlreadyLoaded(imageName: string): boolean {
    const element = document.getElementById(imageName);
    return element != null;
}

/**
 * Returns a collection of all unique images referenced in the given map data that have not yet been loaded.
 * @param map The map data reprrsenting a level with tilesets and entity assets.
 */
export function getImagesToLoad(map: IMapSchema): string[] {
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
export function lazyLoadImages(imageNames: string[]): Promise<any> {
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
export function buildCollisionsCollection(map: IMapSchema): ICollisionSegment[] {
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
export function buildEntityCollection(map: IMapSchema): IEntity[] {
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
