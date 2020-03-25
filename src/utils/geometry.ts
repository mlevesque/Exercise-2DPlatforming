// used for checking if a value is extremely close to zero
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

/**
 * Describes a bounding rectangle.
 */
export interface IArea {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
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
/**
 * Creates a bounding area with the given parameters.
 * @param minX 
 * @param minY 
 * @param maxX 
 * @param maxY 
 */
export function createArea(minX: number, minY: number, maxX: number, maxY: number): IArea {
    return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility Methods
/**
 * Returns a zero vector.
 */
export function zeroVector(): IVector {return createVector(0, 0)}

/**
 * Adds the two given vectors and returns a new vector.
 * @param a 
 * @param b 
 */
export function add(a: IVector, b: IVector): IVector {return {x: a.x + b.x, y: a.y + b.y}}

/**
 * Subtracts the second given vector from the first given vector and returns a new vector.
 * @param a 
 * @param b 
 */
export function subtract(a: IVector, b: IVector): IVector {return {x: a.x - b.x, y: a.y - b.y}}

/**
 * Returns a negated version of the given vector as a new vector.
 * @param v 
 */
export function negate(v: IVector): IVector {return {x: -v.x, y: -v.y}}

/**
 * Multiplies the given scalar to the given vector and returns a new vector.
 * @param s 
 * @param v 
 */
export function scale(s: number, v: IVector): IVector {return {x: s * v.x, y: s * v.y}}

/**
 * Performs a dot product of the two given vectors and returns the result.
 * @param a 
 * @param b 
 */
export function dot(a: IVector, b: IVector): number {return a.x * b.x + a.y * b.y}

/**
 * Performs a cross product of the two given vectors and returns the result.
 * @param a 
 * @param b 
 */
export function cross(a: IVector, b: IVector): number {return a.x * b.y - b.x * a.y}

/**
 * Returns the squared length of the given vector.
 * @param v 
 */
export function vectorSquaredLength(v: IVector): number {return v.x * v.x + v.y * v.y}

/**
 * Returns the length of the given vector.
 * @param v 
 */
export function vectorLength(v: IVector): number {return Math.sqrt(vectorSquaredLength(v))}

/**
 * Scales the given vector so that its length is 1.
 * @param v 
 */
export function normalize(v: IVector): IVector {let len = vectorLength(v); return {x: v.x / len, y: v.y / len}}

/**
 * Returns a vector position along the given ray at the given position t.
 * @param ray 
 * @param t 
 */
export function getPositionAlongRay(ray: IRay, t: number): IVector {return add(ray.p, scale(t, ray.v))}

/**
 * Returns true if the given number is zero, or extrememly close to zero.
 * @param val 
 */
export function isPracticallyZero(val: number): boolean {return val < epilson && val > -epilson}

/**
 * Returns true if the given vector's x and y coordinates are zero, or extremely close to zero.
 * @param v 
 */
export function isPracticallyZeroVector(v: IVector): boolean {return isPracticallyZero(v.x) && isPracticallyZero(v.y)}

/**
 * Returns the end position of the given ray.
 * @param ray 
 */
export function getEndOfRay(ray: IRay): IVector {return add(ray.p, ray.v)}

/**
 * Returns a new ray where the ray's position is offsetted by the given vector.
 * @param ray 
 * @param shiftBy 
 */
export function createShiftedRay(ray: IRay, shiftBy: IVector): IRay {
    const newPos = add(ray.p, shiftBy);
    return createRayPV(newPos.x, newPos.y, ray.v.x, ray.v.y);
}

/**
 * Returns true if the two given vectors are parallel, or extremely close to being parallel.
 * @param a 
 * @param b 
 */
export function isParallel(a: IVector, b: IVector): boolean {return isPracticallyZero(cross(a, b))}

/**
 * Returns true if the two given vectors are equal to each other.
 * @param a 
 * @param b 
 */
export function areVectorsEqual(a: IVector, b: IVector): boolean {return a.x == b.x && a.y == b.y}

/**
 * Returns true if the given vector's x and y coordinates are zero.
 * @param v 
 */
export function isZeroVector(v: IVector): boolean {return v.x == 0 && v.y == 0}

/**
 * Returns an area bounding box for the given collision segment ray,
 * @param ray 
 */
export function buildAreaFromRay(ray: IRay): IArea {
    return {
        minX: Math.min(ray.p.x, ray.p.x + ray.v.x),
        minY: Math.min(ray.p.y, ray.p.y + ray.v.y),
        maxX: Math.max(ray.p.x + ray.v.x, ray.p.x),
        maxY: Math.max(ray.p.y + ray.v.y, ray.p.y)
    }
}

/**
 * Returns a bounding area that expands the given bounds to include the given vector.
 * @param area 
 * @param p 
 */
export function updateBoundsForArea(area: IArea, p: IVector): IArea {
    return {
        minX: Math.min(area.minX, p.x),
        minY: Math.min(area.minY, p.y),
        maxX: Math.max(area.maxX, p.x),
        maxY: Math.max(area.maxY, p.y)
    }
}

/**
 * Returns true if the first given bounding area is located completely inside the second given bounding area.
 * @param a 
 * @param b 
 */
export function isBoundsACompletelyInsideBoundsB(a: IArea, b: IArea): boolean {
    return a.minX >= b.minX && a.minY >= b.minY && a.maxX <= b.maxX && a.maxY <= b.maxY;
}

/**
 * Returns true if the two given areas are intersecting.
 * @param a 
 * @param b 
 */
export function areAreasIntersecting(a: IArea, b: IArea): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX
        && a.minY <= b.maxY && a.maxY >= b.minY;
}
