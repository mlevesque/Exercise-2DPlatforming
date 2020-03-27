import { Guid } from "guid-typescript";
import { IEntity, EntityType } from "../redux/state";
import { IVector } from "./geometry";
import { buildSpriteAnimation, EntityAnimation } from "../animation/SpriteAnimation";
import { buildMovementData } from "../physics/integration/MovementData";
import { getEntityJsonData } from "./jsonSchemas";
import { buildEntityBehavior } from "../behaviors/factory";

export function buildEntity(type: EntityType, flip: boolean, animation: EntityAnimation, position: IVector): IEntity {
    const id = Guid.create().toString();
    const jsonData = getEntityJsonData(type);
    const spriteAnimation = buildSpriteAnimation(id, jsonData.spritesheet, jsonData.animations);
    spriteAnimation.setAnimation(animation, true);
    spriteAnimation.setFlip(flip);
    return {
        id: id,
        type: type,
        behavior: buildEntityBehavior(type),
        spriteAnimation: spriteAnimation,
        movementData: buildMovementData(position),
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
