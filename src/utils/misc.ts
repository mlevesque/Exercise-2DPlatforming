import { ICamera } from "../redux/state";
import { IArea } from "./geometry";

/**
 * Returns the area covered by the given camera, in world units.
 * @param camera 
 */
export function getAreaFromCamera(camera: ICamera): IArea {
    const pos = camera.positionData.position;
    return {
        minX: pos.x - camera.halfWidth,
        maxX: pos.x + camera.halfWidth,
        minY: pos.y - camera.halfHeight,
        maxY: pos.y + camera.halfHeight
    }
}
