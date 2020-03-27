import { IBehaviorComponentMap } from "./IBehavior";
import { WorldCollisionEvent } from "../events/GameEvents";
import { BehaviorCollisionComponent } from "./BehaviorComponents";
import { isFloor } from "../physics/util";

/**
 * Event handler for world collision events.
 * @param event 
 * @param behaviorComMap 
 */
export function handleWorldCollision(event: WorldCollisionEvent, behaviorComMap: IBehaviorComponentMap): void {
    const collisionBehavior = behaviorComMap.getComponent(BehaviorCollisionComponent);
    collisionBehavior.collisionType = event.collisionType.rawValue;

    // attach segment if we are on the ground
    if (event.collisionType.hasFloorCollision()) {
        const seg = event.collisionSegments.find(isFloor);
        collisionBehavior.segId = seg ? seg.id : "";
    }
    else {
        collisionBehavior.segId = "";
    }
}
