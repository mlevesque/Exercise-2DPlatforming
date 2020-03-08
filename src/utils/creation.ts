import { Guid } from "guid-typescript";
import { IEntity, EntityType, EntityAnimation, ICamera } from "../redux/state";
import { IVector } from "./geometry";
import { createEntityBehaviorData } from "../behaviors/utils";

export function buildEntity(type: EntityType, flip: boolean, animation: EntityAnimation, position: IVector): IEntity {
    return {
        id: Guid.create().toString(),
        type: type,
        behavior: createEntityBehaviorData(type),
        flip: flip,
        currentAnimation: animation,
        currentFrame: 0,
        elapsedTime: 0,
        impulses: {},
        velocity: {x: 0, y: 0},
        prevPosition: Object.assign({}, position),
        position: Object.assign({}, position),
    }
}

export function deepCopy(obj: any): any {
    let copy: any;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function copyEntity(entity: IEntity): IEntity {
    return deepCopy(entity);
}

export function copyCamera(camera: ICamera): ICamera {
    return deepCopy(camera);
}
