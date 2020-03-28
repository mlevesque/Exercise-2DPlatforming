/**
 * Series of bit flags indicating types of collision.
 * Bits are set up so that a collision can be inclusively most of these types.
 *  Bit locations: 1234 5678
 *      1) Right Wall
 *      2) Left Wall
 *      3) Ceiling
 *      4) Floor
 *      5) Ceiling End Ledge
 *      6) Ceiling Start Ledge
 *      7) Floor End Ledge
 *      8) Floor Start Ledge
 */
export enum CollisionFlag {
    // individual classifications
    None                = 0x00, // 0000 0000
    Floor               = 0x10, // 0001 0000
    Ceiling             = 0x20, // 0010 0000
    LeftWall            = 0x40, // 0100 0000
    RightWall           = 0x80, // 1000 0000
    FloorStartLedge     = 0x11, // 0001 0001
    FloorEndLedge       = 0x12, // 0001 0010
    CeilingStartLedge   = 0x24, // 0010 0100
    CeilingEndLedge     = 0x28, // 0010 1000

    AllLedges           = 0x0F, // 0000 1111
}

/**
 * Stores flags classifying a kind of collision.
 */
export class CollisionType {
    // stores all the bit flags
    private _value: number;

    /**
     * Constructor.
     * @param value can be a bit flag or the raw value from another instance
     */
    constructor(value: number = CollisionFlag.None) {
        this._value = value;
    }

    /**
     * Returns the raw value that stores all the bit flags.
     */
    get rawValue(): number {return this._value}

    /**
     * Returns a string representing all set bits.
     */
    toString(): string {
        let elements: string[] = [];
        if (this.hasNoCollision()) {
            elements.push("None");
        }
        else {
            if (this.hasFloorCollision()) elements.push("Floor");
            if (this.hasCeilingCollision()) elements.push("Ceiling");
            if (this.hasLeftWallCollision()) elements.push("LeftWall");
            if (this.hasRightWallCollision()) elements.push("RightWall");
            if (this.hasFloorStartLedgeCollision()) elements.push("FloorStartLedge");
            if (this.hasFloorEndLedgeCollision()) elements.push("FloorEndLedge");
            if (this.hasCeilingStartLedgeCollision()) elements.push("CeilingStartLedge");
            if (this.hasCeilingEndLedgeCollision()) elements.push("CeilingEndLedge");
        }
        return "{" + elements.join(",") + "}";
    }

    /**
     * Sets the bits of the given flag.
     * @param flag 
     */
    setFlag(flag: CollisionFlag): void {
        this._value |= flag;
    }

    /**
     * Unsets the bits of the given flag.
     * @param flag 
     */
    unsetFlag(flag: CollisionFlag): void {
        this._value &= ~flag;
    }

    /** Returns true if no bits are set. */
    hasNoCollision(): boolean {return this._value == CollisionFlag.None}
    /** Returns true if the floor bit is set. */
    hasFloorCollision(): boolean {return this.includesFlag(CollisionFlag.Floor)}
    /** Returns true if the ceiling bit is set. */
    hasCeilingCollision(): boolean {return this.includesFlag(CollisionFlag.Ceiling)}
    /** Returns true if the left wall bit is set. */
    hasLeftWallCollision(): boolean {return this.includesFlag(CollisionFlag.LeftWall)}
    /** Returns true if the right wall bit is set. */
    hasRightWallCollision(): boolean {return this.includesFlag(CollisionFlag.RightWall)}
    /** Returns true if the bits for floor and start ledge bits. */
    hasFloorStartLedgeCollision(): boolean {return this.includesFlag(CollisionFlag.FloorStartLedge)}
    /** Returns true if the bits for floor and end ledge bits. */
    hasFloorEndLedgeCollision(): boolean {return this.includesFlag(CollisionFlag.FloorEndLedge)}
    /** Returns true if the bits for ceiling and start ledge bits. */
    hasCeilingStartLedgeCollision(): boolean {return this.includesFlag(CollisionFlag.CeilingStartLedge)}
    /** Returns true if the bits for ceiling and end ledge bits. */
    hasCeilingEndLedgeCollision(): boolean {return this.includesFlag(CollisionFlag.CeilingEndLedge)}
    /** Returns true if the wall bit is set. */
    hasWallCollision(): boolean {
        return this.includesFlag(CollisionFlag.LeftWall)
            || this.includesFlag(CollisionFlag.RightWall);
    }
    /** Returns true if any floor ledge bit is set. */
    hasFloorLedgeCollision(): boolean {
        return this.includesFlag(CollisionFlag.FloorStartLedge)
            || this.includesFlag(CollisionFlag.FloorEndLedge);
    }
    /** Returns true if any ceiling ledge bit is set. */
    hasCeilingLedgeCollision(): boolean {
        return this.includesFlag(CollisionFlag.CeilingStartLedge)
            || this.includesFlag(CollisionFlag.CeilingEndLedge);
    }
    /** Returns true if any start ledge bit is set. */
    hasStartLedgeCollision(): boolean {
        return this.includesFlag(CollisionFlag.FloorStartLedge) || this.includesFlag(CollisionFlag.CeilingStartLedge);
    }
    /** Returns true if any end ledge bit is set. */
    hasEndLedgeCollision(): boolean {
        return this.includesFlag(CollisionFlag.FloorEndLedge) || this.includesFlag(CollisionFlag.CeilingEndLedge);
    }
    /** Returns true if any ledge bit is set. */
    hasLedgeCollision(): boolean {
        return this.includesFlag(CollisionFlag.FloorStartLedge)
            || this.includesFlag(CollisionFlag.FloorEndLedge)
            || this.includesFlag(CollisionFlag.CeilingStartLedge)
            || this.includesFlag(CollisionFlag.CeilingEndLedge);
    }
    
    /**
     * Returns true if the given flag bits are set.
     * @param flag 
     */
    includesFlag(flag: CollisionFlag): boolean {return (this._value & flag) == flag}

    /**
     * Returns true if only the given flag bits are set and no other bits are set.
     * @param flag 
     */
    includesFlagExclusively(flag: CollisionFlag): boolean {return (this._value & flag) == this._value}

    /**
     * Unsets all bits that indicate a ledge.
     */
    unsetLedge(): void {this.unsetFlag(CollisionFlag.AllLedges)}

    /**
     * Sets all bits from the given type to this type.
     * @param type 
     */
    addType(type: CollisionType): void {this._value |= type._value}

    /**
     * Unsets all set bits from the given type to this type.
     * @param type 
     */
    removeType(type: CollisionType): void {this._value &= ~type._value}

    /**
     * Performs an XOR bit calculation between the given type and this type and stores result in this type.
     * @param type 
     */
    xorType(type: CollisionType): void {this._value ^= type._value}
}
