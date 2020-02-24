import { IInputActions } from "./input.model";
import { ICamera } from "./camera.model";
import { IMap } from "./map.model";
import { IEntity } from "./entity.model";
import { ICollisionSegment } from "./collisions.model";

export interface IMainState {
    loading: boolean;
    input: IInputActions;
    camera: ICamera;
    map: IMap;
    staticCollisions: ICollisionSegment[];
    player: IEntity;
    entities: IEntity[];
}
