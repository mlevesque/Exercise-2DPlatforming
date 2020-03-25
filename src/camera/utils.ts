import { ICamera } from "../redux/state";
import { IArea } from "../utils/geometry";

/**
 * Returns the view area of the given camera.
 * @param camera 
 */
export function getCameraArea(camera: ICamera): IArea {
    const pos = camera.positionData.position;
    return {
        minX: pos.x - camera.halfWidth,
        minY: pos.y - camera.halfHeight,
        maxX: pos.x + camera.halfWidth,
        maxY: pos.y + camera.halfHeight
    }
}
