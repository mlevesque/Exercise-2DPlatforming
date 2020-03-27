import { IMapSchema, getEntityJsonData } from "../utils/jsonSchemas";
import { IEntityEntry } from "../redux/state";
import { cloneVector, zeroVector } from "../utils/geometry";
import { CameraManager } from "../camera/CameraManager";
import { buildCamera, ICameraConfig } from "../camera/Camera";
import { EntityType, IEntity, buildEntity } from "../entities/IEntity";

/**
 * Returns a Promise for loading a level json file with the given name.
 * @param levelName 
 */
export function loadLevelData(levelName: string): Promise<any> {
    return import(
        /* webpackMode: "lazy",
           webpackChunkName: "level" */
        `../assets/json/maps/${levelName}.json`
    );
}

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

    // get background
    if (!isImageAlreadyLoaded(map.background)) {
        uniqueImages.add(map.background);
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
                /* webpackMode: "lazy-once",
                   webpackChunkName: "textures" */
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
 * Builds and returns a list of entity states from the given map data.
 * @param map 
 */
export function buildEntityCollection(map: IMapSchema): IEntity[] {
    let results: IEntity[] = [];
    if (map && map.player) {
        const player = buildEntity(EntityType.Player, map.player.position);
        player.spriteAnimation.setFlip(map.player.flip);
        results.push(player);
    }
    if (map && map.entities) {
        results = results.concat(map.entities.map((entry): IEntity => {
                return buildEntity(entry.type, entry.position);
            })
        );
    }
    return results;
}

/**
 * Builds and returns a list of entity entries from the given entity list. This is used for the redux store.
 * @param entities 
 */
export function buildEntityEntriesFromEntityCollection(entities: IEntity[]): IEntityEntry[] {
    return entities.map((entity: IEntity) => <IEntityEntry>{id: entity.id, type: entity.type});
}

/**
 * Sets up the camera locking if the world is smaller than the camera width or height.
 * @param cameraConfig 
 * @param mapWidth 
 * @param mapHeight 
 */
export function setupCamera(cameraConfig: ICameraConfig, mapWidth: number, mapHeight: number): void {
    const cameraManager = CameraManager.getInstance();
    if (!cameraManager.activeCamera) {
        cameraManager.setActiveCamera(buildCamera(zeroVector(), cameraConfig));
    }
    const camera = cameraManager.activeCamera;
    cameraConfig.lockX = cameraConfig.halfWidth * 2 >= mapWidth;
    cameraConfig.lockY = cameraConfig.halfHeight * 2 >= mapHeight;
    let newPos = cloneVector(camera.movementData.position);
    if (cameraConfig.lockX) {
        newPos.x = mapWidth / 2;
    }
    if (cameraConfig.lockY) {
        newPos.y = mapHeight / 2;
    }
    camera.movementData.setPosition(newPos);
}
