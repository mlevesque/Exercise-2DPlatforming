import { IPoint } from "./collisions.model";

export enum EntityType {
    Player = "player",
}

export enum EntityAnimation {
    Idle = "idle",
    Walk = 'walk',
    Jump = 'jump',
}

export interface IEntity {
    type: EntityType;

    flip: boolean;
    currentAnimation: EntityAnimation;
    currentFrame: number;
    elapsedTime: number;

    position: IPoint;
}
