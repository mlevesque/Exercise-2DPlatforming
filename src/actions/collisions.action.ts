import { ICollisionSegment } from "../model/collisions.model";
import { AnyAction } from "redux";

export enum CollisionsAction {
    SetStatic = "CollisionsAction.SetStatic",
    Clear = "CollisionsAction.Clear",
}

export function createSetStaticCollisionsAction(collisions: ICollisionSegment[]): AnyAction {
    return {type: CollisionsAction.SetStatic, payload: collisions};
}

export function createClearCollisionsAction(): AnyAction {
    return {type: CollisionsAction.Clear};
}
