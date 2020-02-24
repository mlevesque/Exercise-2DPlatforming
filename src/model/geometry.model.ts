export interface IPoint {
    x: number;
    y: number;
}
export type IVector = IPoint;

export function createVector(x: number, y: number): IVector {
    return {
        x: x,
        y: y
    }
}

export function cloneVector(v: IVector): IVector {
    return Object.assign({}, v);
}

export function zeroVector(): IVector {
    return createVector(0, 0);
}

export function add(a: IVector, b: IVector): IVector {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    }
}

export function subtract(a: IVector, b: IVector): IVector {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    }
}

export function scale(s: number, v: IVector): IVector {
    return {
        x: s * v.x,
        y: s * v.y
    }
}

export function squaredLength(v: IVector): number {
    return v.x * v.x + v.y * v.y;
}

export function length(v: IVector): number {
    return Math.sqrt(squaredLength(v));
}

export function normalize(v: IVector): IVector {
    let len = length(v);
    return {
        x: v.x / len,
        y: v.y / len
    }
}

export function normal(v: IVector): IVector {
    return {
        x: -v.y,
        y: v.x
    }
}
