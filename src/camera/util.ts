import { IVector } from "../utils/geometry";
import { ICamera } from "../redux/state";

export function convertToCameraSpace(worldPos: IVector, camera: ICamera): IVector {
    return {
        x: camera.position.x - worldPos.x,
        y: camera.position.y - worldPos.y,
    }
}
