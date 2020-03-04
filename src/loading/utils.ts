import { IMapSchema, getEntityJsonData, getGameConfig } from "../utils/jsonSchemas";
import { ICollisionSegment, createSegment } from "../physics/CollisionSegment";
import { EntityType, IEntity, EntityAnimation, ICollisionMap } from "../redux/state";
import { buildEntity } from "../utils/creation";
import { createVector, IVector, getEndOfRay, areVectorsEqual, dot, negate } from "../utils/geometry";
import { isWall } from "../physics/util";
import { WorldPartition } from "../physics/WorldPartition";

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
 * Returns true if the end of the first given segment is positioned at the start of the second given segment.
 * @param segment1 
 * @param segment2 
 */
export function areSegmentsConnected(segment1: ICollisionSegment, segment2: ICollisionSegment): boolean {
    return segment1.id != segment2.id && areVectorsEqual(getEndOfRay(segment1.segment), segment2.segment.p);
}

/**
 * Checks if the connected surface and wall segments form a ledge. A ledge is defined as if the surface segment is
 * a floor or ceiling segment, the wall segment is a wall or is null, and if the wall segment goes in a direction
 * opposite of the surface segment's normal.
 * @param surfaceSegment 
 * @param wallSegment 
 */
export function isLedgeSurfaceToWall(surfaceSegment: ICollisionSegment, wallSegment: ICollisionSegment): boolean {
    // surface must exist and not be a wall
    if (!surfaceSegment || isWall(surfaceSegment)) {
        return false;
    }

    // if wall segment does not exist, then we have a ledge
    if (!wallSegment) {
        return true;
    }

    // if wall is not a wall, then this cannot be a ledge
    if (!isWall(wallSegment)) {
        return false;
    }

    // make sure that they are connected
    if (surfaceSegment.nextSegment != wallSegment.id && surfaceSegment.prevSegment != wallSegment.id) {
        return false;
    }

    // make sure that the wall is going in a direction opposite of the surface normal
    let wallDirection = (surfaceSegment.nextSegment == wallSegment.id) 
        ? wallSegment.segment.v : negate(wallSegment.segment.v);
    return dot(wallDirection, surfaceSegment.normal) < 0;
}

/**
 * Links the first segment to the second.
 * @param segment1 
 * @param segment2 
 */
export function linkCollisions(segment1: ICollisionSegment, segment2: ICollisionSegment): void {
    if (segment1) segment1.nextSegment = segment2 ? segment2.id : "";
    if (segment2) segment2.prevSegment = segment1 ? segment1.id : "";
}

/**
 * Sets up world partition to the dimenions and cell size based on the map schema data.
 * @param map 
 */
export function buildWorldPartition(map: IMapSchema): void {
    const config = getGameConfig();
    const height = map.map.length * config.tileSize;
    const width = height > 0 ? map.map[0].length * config.tileSize : 0;
    WorldPartition.getInstance().setupPartition(width, height, map.partition.cellWidth, map.partition.cellHeight);
}

/**
 * Builds and returns a collection of collisions from the given map data.
 * @param map 
 */
export function buildCollisionsCollection(map: IMapSchema): Map<string, ICollisionSegment> {
    // build all collisions
    let partition = WorldPartition.getInstance();
    let results = new Map<string, ICollisionSegment>();
    if (map && map.collisions) {
        map.collisions.forEach((collisonSet) => {
            // build segments from collision set
            let setResults: ICollisionSegment[] = [];
            let startPos: IVector = collisonSet.length > 0 ? createVector(collisonSet[0].x, collisonSet[0].y) : null;
            let prevSegment: ICollisionSegment = null;
            for (let i = 1; i < collisonSet.length; ++i) {
                // build collision
                let endPos = createVector(collisonSet[i].x, collisonSet[i].y);
                let segment = createSegment(startPos, endPos);

                // connect to previous collision
                linkCollisions(prevSegment, segment);

                // add to set
                setResults.push(segment);
                results.set(segment.id, segment);

                // add to partition
                partition.addStaticCollision(segment);

                // store for linkage to next segment
                startPos = endPos;
                prevSegment = segment;
            }

            // link first and last segment
            if (setResults.length > 1 && areSegmentsConnected(setResults[setResults.length-1], setResults[0])) {
                linkCollisions(setResults[setResults.length-1], setResults[0]);
            }
        });
    }

    // determine which segments have ledges
    results.forEach((segment) => {
        segment.startLedge = isLedgeSurfaceToWall(segment, results.get(segment.prevSegment));
        segment.endLedge = isLedgeSurfaceToWall(segment, results.get(segment.nextSegment));
    });

    return results;
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
