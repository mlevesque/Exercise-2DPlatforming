import { IEntity } from "../redux/state";
import { GameEventQueue } from "../events/GameEventQueue";

/**
 * Handles all events for all entities in the given collection.
 * @param entityCollection 
 */
function updateEventHandling(entityCollection:IEntity[]): void {
    const eventQueue = GameEventQueue.getInstance();
    entityCollection.forEach((entity: IEntity) => {
        entity.behavior.handleGameEvents(eventQueue.getQueueForId(entity.id));
    });

    // clear event queue
    eventQueue.resetEntireQueue();
}

/**
 * Updates events and behavior actions for all given entities.
 * @param deltaT 
 * @param entityCollection 
 */
export function updateActionBehaviors(deltaT: number, entityCollection: IEntity[]): void {
    updateEventHandling(entityCollection);
    entityCollection.forEach(entity => entity.behavior.handleBehaviorAction(deltaT, entity));
}

/**
 * Updates events and behavior reactions for all given entities.
 * @param deltaT 
 * @param entityCollection 
 */
export function updateReactionBehaviors(deltaT: number, entityCollection: IEntity[]): void {
    updateEventHandling(entityCollection);
    entityCollection.forEach(entity => entity.behavior.handleBehaviorReaction(deltaT, entity));
}
