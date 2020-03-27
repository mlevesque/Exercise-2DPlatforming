import { IBehavior } from "./IBehavior";
import { buildPlayerBehavior } from "./behaviorTypes/PlayerBehavior";
import { EntityType } from "../entities/IEntity";

export function buildEntityBehavior(type: EntityType): IBehavior {
    switch (type) {
        case EntityType.Player:
            return buildPlayerBehavior();
    }
}
