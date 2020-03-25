import { CollisionType } from "../physics/collisions/collisionType";
import { MoveDirection } from "../behaviors/utils";
import { ICollisionSegment } from "../physics/collisions/CollisionSegment";

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
    private _jump: boolean;
    constructor(direction: MoveDirection, jump: boolean) {
        super(GameEventType.InputAction);
        this._direction = direction;
        this._jump = jump;
    }
    get direction(): MoveDirection {return this._direction}
    get jump(): boolean {return this._jump}
}

export class WorldCollisionEvent extends GameEvent {
    private _collisionType: CollisionType;
    private _collisionSegments: ICollisionSegment[];
    constructor(collisionType: CollisionType, collisionSegments: ICollisionSegment[]) {
        super(GameEventType.WorldCollision);
        this._collisionType = collisionType;
        this._collisionSegments = collisionSegments;
    }
    get collisionType(): CollisionType {return this._collisionType}
    get collisionSegments(): ICollisionSegment[] {return this._collisionSegments}
}
