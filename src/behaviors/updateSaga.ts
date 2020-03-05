import { IEntity, EntityType } from "../redux/state";
import { EntityEventHandleMap, EntityUpdateBehaviorMap } from "./common";
import { updatePlayerReactionBehavior, playerEventHandlerMapping, updatePlayerActionBehavior } from "./player";
import { GameEventQueue } from "../events/GameEventQueue";
import { GameEvent } from "../events/GameEvents";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAPPINGS
const entityHandleEventMapping = new Map<EntityType, EntityEventHandleMap>([
    [EntityType.Player, playerEventHandlerMapping]
]);

const entityActionUpdateMapping: EntityUpdateBehaviorMap = new Map([
    [EntityType.Player, updatePlayerActionBehavior]
]);

const entityReactionUpdateMapping: EntityUpdateBehaviorMap = new Map([
    [EntityType.Player, updatePlayerReactionBehavior]
]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UPDATES
function updateEntityBehaviors(deltaT:number, entityCollection:IEntity[], updateMapping:EntityUpdateBehaviorMap): void {
    const eventQueue = GameEventQueue.getInstance();
    entityCollection.forEach((entity: IEntity) => {
        // process all events for entity
        const mapping = entityHandleEventMapping.get(entity.type);
        if (mapping) {
            const events = eventQueue.getQueueForId(entity.id);
            events.forEach((event: GameEvent) => {
                if (mapping.has(event.type)) {
                    mapping.get(event.type)(entity.behavior, event);
                }
            })
        }

        // call update behavior
        updateMapping.get(entity.type)(deltaT, entity);
    })

    // clear event queue
    eventQueue.resetEntireQueue();
}

export function updateActionBehaviors(deltaT: number, entityCollection: IEntity[]): void {
    updateEntityBehaviors(deltaT, entityCollection, entityActionUpdateMapping);
}

export function updateReactionBehaviors(deltaT: number, entityCollection: IEntity[]): void {
    updateEntityBehaviors(deltaT, entityCollection, entityReactionUpdateMapping);
}
