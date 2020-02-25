import { IVector } from "./geometry.model";
import { Guid } from "guid-typescript";

export enum EntityType {
    Player = "player",
}

export enum EntityAnimation {
    Idle = "idle",
    Walk = 'walk',
    Jump = 'jump',
}

export interface IEntity {
    id: string;
    type: EntityType;

    flip: boolean;
    currentAnimation: EntityAnimation;
    currentFrame: number;
    elapsedTime: number;

    impulse: IVector;
    velocity: IVector;
    prevPosition: IVector;
    position: IVector;
}

export function buildEntity(type: EntityType, flip: boolean, animation: EntityAnimation, position: IVector): IEntity {
    return {
        id: Guid.create().toString(),
        type: type,
        flip: flip,
        currentAnimation: animation,
        currentFrame: 0,
        elapsedTime: 0,
        impulse: {x: 0, y: 0},
        velocity: {x: 0, y: 0},
        prevPosition: Object.assign({}, position),
        position: Object.assign({}, position),
    }
}

export function copyEntity(entity: IEntity): IEntity {
    let newEntity: IEntity = Object.assign({}, entity);
    newEntity.position = Object.assign({}, entity.position);
    return newEntity;
}
