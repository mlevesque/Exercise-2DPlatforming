import { EntityType } from "../redux/state";
import { IBehavior } from "./IBehavior";
import { buildPlayerBehavior } from "./behaviorTypes/PlayerBehavior";

export function buildEntityBehavior(type: EntityType): IBehavior {
    switch (type) {
        case EntityType.Player:
            return buildPlayerBehavior();
    }
}
