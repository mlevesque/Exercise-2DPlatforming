/** Specifies the type of horizontal entity movement. */
export enum MoveDirection {
    None = "None",
    Left = "Left",
    Right = "Right",
}

/** Interface that makes mapping possible by using the component type as the key. */
export interface BehaviorComponentType<T extends IBehaviorComponent> { new(...args: any[]): T }

/**
 * Base interface for all behavior components.
 */
export interface IBehaviorComponent {}

/**
 * Component for entity movement.
 */
export class BehaviorMovementComponent implements IBehaviorComponent {
    moveDirection: MoveDirection;

    constructor() {
        this.moveDirection = MoveDirection.None;
    }
}

/**
 * Component for entity jumping.
 */
export class BehaviorJumpComponent implements IBehaviorComponent {
    jumpPressed: boolean;
    jumping: boolean;
    jumpDuration: number;
    jumpKeyElapsedTime: number;
    onGround: boolean;

    constructor() {
        this.jumpPressed = false;
        this.jumping = false;
        this.jumpDuration = 0;
        this.jumpKeyElapsedTime = 0;
        this.onGround = false;
    }
}
