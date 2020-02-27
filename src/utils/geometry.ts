const epilson = 0.0000001;

/**
 * Represents a vector or a point in 2D space.
 */
export interface IVector {
    x: number;
    y: number;
}

/**
 * Represents a ray in 2D space. A ray is described by a position point and a vector direction.
 */
export interface IRay {
    p: IVector;
    v: IVector;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Creation Methods
/**
 * Creates a new instance of a vector with the given coordinates.
 * @param x 
 * @param y 
 */
export function createVector(x: number, y: number): IVector {
    return {x: x, y: y};
}
/**
 * Makes an object clone of the given vector.
 * @param v 
 */
export function cloneVector(v: IVector): IVector {
    return Object.assign({}, v);
}
/**
 * Creates a new instance of a ray from the given position and direction values.
 * @param px 
 * @param py 
 * @param vx 
 * @param vy 
 */
export function createRayPV(px: number, py: number, vx: number, vy: number): IRay {
    return {p: createVector(px, py), v: createVector(vx, vy)};
}
/**
 * Creates a new instance of a ray from the given start and end positions.
 * @param sx 
 * @param sy 
 * @param ex 
 * @param ey 
 */
export function createRayPP(sx: number, sy: number, ex: number, ey: number): IRay {
    return {p: createVector(sx, sy), v: createVector(ex - sx, ey - sy)};
}
/**
 * Makes a deep object clone of the given ray.
 * @param ray 
 */
export function cloneRay(ray: IRay): IRay {
    return {p: cloneVector(ray.p), v: cloneVector(ray.v)};
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Methods
export function zeroVector(): IVector {return createVector(0, 0)}
export function add(a: IVector, b: IVector): IVector {return {x: a.x + b.x, y: a.y + b.y}}
export function subtract(a: IVector, b: IVector): IVector {return {x: a.x - b.x, y: a.y - b.y}}
export function negate(v: IVector): IVector {return {x: -v.x, y: -v.y}}
export function scale(s: number, v: IVector): IVector {return {x: s * v.x, y: s * v.y}}
export function dot(a: IVector, b: IVector): number {return a.x * b.x + a.y * b.y}
export function cross(a: IVector, b: IVector): number {return a.x * b.y - b.x * a.y}
export function vectorSquaredLength(v: IVector): number {return v.x * v.x + v.y * v.y}
export function vectorLength(v: IVector): number {return Math.sqrt(vectorSquaredLength(v))}
export function normalize(v: IVector): IVector {let len = vectorLength(v); return {x: v.x / len, y: v.y / len}}
export function getPositionAlongRay(ray: IRay, t: number): IVector {return add(ray.p, scale(t, ray.v))}
export function isPracticallyZero(val: number): boolean {return val < epilson && val > -epilson}
export function isPracticallyZeroVector(v: IVector): boolean {return isPracticallyZero(v.x) && isPracticallyZero(v.y)}
export function getEndOfRay(ray: IRay): IVector {return add(ray.p, ray.v)}
export function createShiftedRay(ray: IRay, shiftBy: IVector): IRay {
    const newPos = add(ray.p, shiftBy);
    return createRayPV(newPos.x, newPos.y, ray.v.x, ray.v.y);
}
export function isParallel(a: IVector, b: IVector): boolean {return isPracticallyZero(cross(a, b))}
