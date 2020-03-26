import { EntityType } from "../redux/state";
import { createPlayerBehaviorData } from "./player";

/** Specifies the type of horizontal entity movement. */
export enum MoveDirection {
    None = "None",
    Left = "Left",
    Right = "Right",
}

/**
 * Returns a entity behavior data object for a given entity type.
 * @param entityType 
 */
export function createEntityBehaviorData(entityType: EntityType): any {
    switch (entityType) {
        case EntityType.Player:
            return createPlayerBehaviorData();
    }
}
