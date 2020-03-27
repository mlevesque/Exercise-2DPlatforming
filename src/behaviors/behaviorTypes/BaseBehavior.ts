import { IBehaviorComponentMap, IBehavior, IHandleGameEvent } from "../IBehavior";
import { IBehaviorComponent, BehaviorComponentType } from "../BehaviorComponents";
import { GameEventType, GameEvent } from "../../events/GameEvents";
import { IEntity } from "../../entities/IEntity";

/**
 * Mapping of behavior components for an entity behavior.
 */
class BehaviorComponentMap implements IBehaviorComponentMap {
    /** Stores all behavior components. Access them with getBehavior. */
    private _behaviorComponents: Map<string, IBehaviorComponent>;

    /**
     * Constructor. Sets up the map with the given list of components. This will only store components with unique
     * component types.
     * @param components 
     */
    public constructor(components: IBehaviorComponent[]) {
        this._behaviorComponents = new Map();
        components.forEach(com => this._behaviorComponents.set(com.constructor.name, com));
    }

    /**
     * Returns true if the component of the given type is in the component map.
     *      Let's say a component type we want is declared as MyComponent, then calling this will look like:
     *          hasComponent(MyComponent)
     * @param type 
     */
    public hasComponent<T extends IBehaviorComponent>(type: BehaviorComponentType<T>): boolean {
        return this._behaviorComponents.has(type.name);
    }

    /**
     * Returns the component of the given type.
     *      Let's say a component type we want is declared as MyComponent, then calling this will look like:
     *          getComponent(MyComponent)
     * @param type 
     */
    public getComponent<T extends IBehaviorComponent>(type: BehaviorComponentType<T>): T | undefined {
        return this._behaviorComponents.get(type.name) as T;
    }
}

/**
 * Base behavior class for all entity behaviors. Subclass this and implement the abstract methods for different
 * entity types.
 */
export abstract class BaseBehavior implements IBehavior {
    /** Container for the mapping of all behavior components for this behavior. */
    private _behaviorComponentMap: IBehaviorComponentMap;
    /** Stores all event handles for the behavior. */
    private _eventHandlers: Map<GameEventType, IHandleGameEvent>

    /**
     * Implement this in child classes to populate it with the needed components.
     */
    protected abstract buildBehaviorComponents(): IBehaviorComponent[];

    /**
     * Implement this in child classes to setup game event handlers.
     */
    protected abstract buildEventHandlerLinks(): [GameEventType, IHandleGameEvent][];

    /**
     * Constructor. Sets up components and event handlers.
     */
    public constructor() {
        // setup components
        this._behaviorComponentMap = new BehaviorComponentMap(this.buildBehaviorComponents());

        // setup event handlers
        this._eventHandlers = new Map();
        const eventHandlers = this.buildEventHandlerLinks();
        eventHandlers.forEach(entry => this._eventHandlers.set(entry[0], entry[1]));
    }

    /** Returns the component mapping of this behavior. */
    public get componentMap(): IBehaviorComponentMap {return this._behaviorComponentMap}

    /**
     * Called just before both behavior action and behavior reaction. Processes all queued events for the entity.
     * @param event 
     */
    public handleGameEvents(events: GameEvent[]): void {
        events.forEach((event: GameEvent) => {
            const handler = this._eventHandlers.get(event.type);
            if (handler) {
                handler(event, this._behaviorComponentMap);
            }
        });
    }

    /**
     * Called every frame after input but before physics.
     * @param deltaT The frame time.
     * @param entity The entity this behavior belongs to.
     */
    public abstract handleBehaviorAction(deltaT: number, entity: IEntity): void;

    /**
     * Called every frame after physics but before animation update.
     * @param deltaT The frame time.
     * @param entity The entity this behavior belongs to.
     */
    public abstract handleBehaviorReaction(deltaT: number, entity: IEntity): void;
}
