import { CollisionType } from "../physics/collisionType";
import { MoveDirection } from "../behaviors/utils";

export enum GameEventType {
    InputAction = "InputAction",
    WorldCollision = "WorldCollision"
}

export class GameEvent {
    private _type: GameEventType;
    constructor(type: GameEventType) {this._type = type}
    get type(): GameEventType {return this._type}
}

export class InputActionEvent extends GameEvent {
    private _direction: MoveDirection;
    constructor(direction: MoveDirection) {
        super(GameEventType.InputAction);
        this._direction = direction;
    }
    get direction(): MoveDirection {return this._direction}
}

export class WorldCollisionEvent extends GameEvent {
    private _collisionType: CollisionType;
    constructor(collisionType: CollisionType) {
        super(GameEventType.WorldCollision);
        this._collisionType = collisionType;
    }
    get collisionType(): CollisionType {return this._collisionType}
}

