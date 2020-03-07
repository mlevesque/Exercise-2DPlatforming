import { ICollisionSegment } from "./CollisionSegment";
import { IVector, createVector, IRay, IArea, getEndOfRay, areVectorsEqual } from "../utils/geometry";

export type SegmentCollisionsMap = Map<string, ICollisionSegment>;

/**
 * A single cell in the world partition that contains collision informaton in a small area of the world.
 */
export class PartitionCell {
    constructor() {
        this.staticCollisions = [];
    }

    // All world collisions that do not change
    staticCollisions: ICollisionSegment[];
}

/**
 * Container for collision objects that are divided up into a configurable grid, meant to improve performance uring
 * collision detection by focusing collison checks only on collision objects in a small vicinity to an entity. This
 * is a singleton class and is globally accessible,
 */
export class WorldPartition {
    // the singleton instance
    private static _instance: WorldPartition;

    // width in world units of the partition
    private _width: number;
    // height in world units of the partition
    private _height: number;
    // width of a single partition cell in world units
    private _cellWidth: number;
    // height of a single partition cell in world units
    private _cellHeight: number;
    // grid of all partition cells, row major
    private _cells: PartitionCell[][];

    private constructor() {}

    /**
     * Returns the calculated t values along the given ray where it intersects the next cell borders in the given x and
     * y positions. Used for traversing through the grid for inserting a collision segment in the cells that it spans
     * into.
     * @param ray 
     * @param nextCellX 
     * @param nextCellY 
     */
    private getNextCellTValues(ray: IRay, nextCellX: number, nextCellY: number): [number, number] {
        const worldCellX = this.getWorldXFromCellX(nextCellX);
        const worldCellY = this.getWorldYFromCellY(nextCellY);
        
        // calculate t values
        // note that we explicitly check for if the vector of the ray is zero in both directions and just make the
        // t value infinity is they are. This is to circumvent if the segment is colinear with one of the grid lines.
        // When a segment is colinear, the resulting t becomes NaN. Instead, we just want it to be the largest value
        // so when we find the smaller t, the NaN t will be disregarded.
        return [
            ray.v.x == 0 ? Infinity : (worldCellX - ray.p.x) / ray.v.x,
            ray.v.y == 0 ? Infinity : (worldCellY - ray.p.y) / ray.v.y
        ]
    }

    /**
     * Inserts the given collision segment into the cells that it intersects into.
     * @param segment 
     */
    private insertSegment(segment: ICollisionSegment): void {
        const ray = segment.segment;
        const xDir = ray.v.x > 0 ? 1 : -1;
        const yDir = ray.v.y > 0 ? 1 : -1;
        const nextXDir = ray.v.x > 0 ? 1 : 0;
        const nextYDir = ray.v.y > 0 ? 1 : 0;
        const endCell = this.convertWorldPositionToCellPosition(getEndOfRay(ray));
        let cellPos = this.convertWorldPositionToCellPosition(ray.p);

        // loop until we get to the ending cell
        let cell: PartitionCell;
        while (!areVectorsEqual(cellPos, endCell)) {
            // insert into current cell
            cell = this.getCellFromCellCoordinates(cellPos);
            if (cell) {
                cell.staticCollisions.push(segment);
            }

            // go to next cell
            const nextT = this.getNextCellTValues(ray, cellPos.x + nextXDir, cellPos.y + nextYDir);
            if (nextT[0] <= nextT[1]) {
                cellPos.x += xDir;
            }
            if (nextT[0] >= nextT[1]) {
                cellPos.y += yDir;
            }
        }

        // add to end cell
        cell = this.getCellFromCellCoordinates(cellPos);
        if (cell) {
            cell.staticCollisions.push(segment);
        }
    }

    /**
     * Returns the singleton instance of this class. If the instance has not be created, it will be instantiated before
     * returning it.
     */
    public static getInstance(): WorldPartition {
        if (!this._instance) {
            this._instance = new WorldPartition();
        }
        return this._instance;
    }


    /** Returns the width of the partition in world units. */
    get width(): number {return this._width}
    /** Returns the height of the partition in world units. */
    get height(): number {return this._height}
    /** Returns the width of a single cell partition in world units. */
    get cellWidth(): number {return this._cellWidth}
    /** Returns the height of a single cell partition in world units. */
    get cellHeight(): number {return this._cellHeight}
    /** Returns the number of rows in the partition grid. */
    get numRows(): number {return this._cells.length}
    /** Returns the number of columns in the partition grid. */
    get numColumns(): number {return this._cells.length > 0 ? this._cells[0].length : 0}


    /**
     * Returns a string representation of the partition.
     */
    toString(): string {
        let result = "World Partition: width=" + this._width + " height=" + this._height + " cellWidth=" 
            + this._cellWidth + " cellHeight=" + this._cellHeight + "\n";
        for (let y = 0; y < this.numRows; ++y) {
            for (let x = 0; x < this.numColumns; ++x) {
                const cell = this.getCellFromCellCoordinates(createVector(x, y));
                result += "[" + cell.staticCollisions.length.toString().padStart(3, " ") + "]";
            }
            result += "\n";
        }
        return result;
    }

    /**
     * Clears out the partition of all collisions.
     */
    clearPartition(): void {
        this.setupPartition(this._width, this._height, this._cellWidth, this._cellHeight);
    }

    /**
     * Sets up the partition grid with the dimensions based on the given parameters.
     * @param width width of the world map in world units
     * @param height height of the world map in world units
     * @param cellWidth width of every cell in world units
     * @param cellHeight height of every cell in world units
     */
    setupPartition(width: number, height: number, cellWidth: number, cellHeight: number): void {
        this._width = width;
        this._height = height;
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;
        this._cells = [];
        let distY = 0;
        while (distY < height) {
            let distX = 0;
            let row: PartitionCell[] = [];
            while (distX < width) {
                row.push(new PartitionCell());
                distX += cellWidth;
            }
            this._cells.push(row);
            distY += cellHeight;
        }
    }

    /**
     * Returns a new vector in cell units from the given vector in world units.
     * @param worldPos vector in world units
     */
    convertWorldPositionToCellPosition(worldPos: IVector): IVector {
        return {
            x: this.getCellXFromWorldX(worldPos.x),
            y: this.getCellYFromWorldY(worldPos.y)
        }
    }

    /**
     * Returns a new bounding area in cell units from the given bounding area in world units.
     * @param worldArea bounding area in world units
     */
    convertWorldAreaToCellArea(worldArea: IArea): IArea {
        return {
            minX: this.getCellXFromWorldX(worldArea.minX),
            minY: this.getCellYFromWorldY(worldArea.minY),
            maxX: this.getCellXFromWorldX(worldArea.maxX),
            maxY: this.getCellYFromWorldY(worldArea.maxY)
        }
    }

    /**
     * Returns the X coordinate in cell units from the given X coordinate in world units.
     * @param x 
     */
    getCellXFromWorldX(x: number): number {
        return Math.floor(x / this._cellWidth);
    }

    /**
     * Returns the Y coordinate in cell units from the given Y coordinate in world units.
     * @param y 
     */
    getCellYFromWorldY(y: number): number {
        return Math.floor(y / this._cellHeight);
    }

    getWorldXFromCellX(x: number): number {
        return x * this._cellWidth;
    }

    getWorldYFromCellY(y: number): number {
        return y * this._cellHeight;
    }

    /**
     * Returns true if the given vector in cell units is in range of the partition grid cell coordinates.
     * @param cellPos 
     */
    areCellCoordinatesValid(cellPos: IVector): boolean {
        return cellPos.x >= 0 && cellPos.x < this.numColumns && cellPos.y >= 0 && cellPos.y < this.numRows;
    }

    /**
     * Adds the given static collision segment into the partition. It will be added to any cells that it lies inside.
     * @param segment 
     */
    addStaticCollision(segment: ICollisionSegment): void {
        this.insertSegment(segment);
    }

    /**
     * Returns the partition cell at the given cell unit coordinates. Returns null if the coordinates are outside the
     * partition.
     * @param cellPos vector in cell units
     */
    getCellFromCellCoordinates(cellPos: IVector): PartitionCell {
        if (this.areCellCoordinatesValid(cellPos)) {
            return this._cells[cellPos.y][cellPos.x];
        }
        return null;
    }

    /**
     * Returns all collisions at the given cell position.
     * @param cellPos vector in cell units
     */
    getCollisionsAtCellCoordinates(cellPos: IVector): ICollisionSegment[] {
        const cell = this.getCellFromCellCoordinates(cellPos);
        if (cell) {
            return cell.staticCollisions;
        }
        return [];
    }

    /**
     * Returns all unique collisions in all cells that lie within the given bounding area in world units.
     * @param worldArea 
     */
    getCollisionsInWorldArea(worldArea: IArea): SegmentCollisionsMap {
        let results: SegmentCollisionsMap = new Map();
        const cellArea = this.convertWorldAreaToCellArea(worldArea);
        for (let y = cellArea.minY; y <= cellArea.maxY; ++y) {
            for( let x = cellArea.minX; x <= cellArea.maxX; ++x) {
                const collisions = this.getCollisionsAtCellCoordinates(createVector(x, y));
                collisions.forEach((segment: ICollisionSegment) => {
                    results.set(segment.id, segment);
                });
            }
        }
        return results;
    }
}
