import { MoveDirection } from "../behaviors/BehaviorComponents";

export enum GameEventType {
    InputAction = "InputAction",
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
