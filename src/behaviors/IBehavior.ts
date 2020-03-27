import { IEntity } from "../redux/state";
import { IBehaviorComponent, BehaviorComponentType } from "./BehaviorComponents";
import { GameEvent } from "../events/GameEvents";

/**
 * Interface for a base behavior for an entity.
 */
export interface IBehavior {
    readonly componentMap: IBehaviorComponentMap;
    handleGameEvents(events: GameEvent[]): void;
    handleBehaviorAction(deltaT: number, entity: IEntity): void;
    handleBehaviorReaction(deltaT: number, entity: IEntity): void;
}

/** Signature for a game event handler for behaviors. */
export interface IHandleGameEvent{ (event: GameEvent, behaviorComMap: IBehaviorComponentMap): void }

/**
 * Interface for the behavior component map.
 */
export interface IBehaviorComponentMap {
    hasComponent<T extends IBehaviorComponent>(type: BehaviorComponentType<T>): boolean;
    getComponent<T extends IBehaviorComponent>(type: BehaviorComponentType<T>): T | undefined;
}
