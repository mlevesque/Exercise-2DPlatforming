import { ICollisionSegment, cloneSegment } from "../model/collisions.model";
import { InitState } from "./InitState";
import { AnyAction } from "redux";
import { CollisionsAction } from "../actions/collisions.action";

export function staticCollisionsReducer(state: ICollisionSegment[] = InitState.staticCollisions, action: AnyAction): ICollisionSegment[] {
    switch (action.type) {
        case CollisionsAction.SetStatic:
            return action.payload.map((segment: ICollisionSegment) => {
                return cloneSegment(segment);
            });
        case CollisionsAction.Clear:
            return [];
    }
    return state;
}
