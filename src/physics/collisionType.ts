/**
 * Series of bit flags indicating types of collision.
 */
export enum CollisionFlag {
    // individual classifications
    None                = 0x00,
    Floor               = 0x10,
    Ceiling             = 0x20,
    Wall                = 0x40,
    FloorStartLedge     = 0x11,
    FloorEndLedge       = 0x12,
    CeilingStartLedge   = 0x24,
    CeilingEndLedge     = 0x28,

    AllLedges           = 0x0F
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
            if (this.hasFloorCollison()) elements.push("Floor");
            if (this.hasCeilingCollison()) elements.push("Ceiling");
            if (this.hasWallCollison()) elements.push("Wall");
            if (this.includesFlag(CollisionFlag.FloorStartLedge)) elements.push("FloorStartLedge");
            if (this.includesFlag(CollisionFlag.FloorEndLedge)) elements.push("FloorEndLedge");
            if (this.includesFlag(CollisionFlag.CeilingStartLedge)) elements.push("CeilingStartLedge");
            if (this.includesFlag(CollisionFlag.CeilingEndLedge)) elements.push("CeilingEndLedge");
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
    hasFloorCollison(): boolean {return this.includesFlag(CollisionFlag.Floor)}
    /** Returns true if the ceiling bit is set. */
    hasCeilingCollison(): boolean {return this.includesFlag(CollisionFlag.Ceiling)}
    /** Returns true if the wall bit is set. */
    hasWallCollison(): boolean {return this.includesFlag(CollisionFlag.Wall)}
    /** Returns true if any floor ledge bit is set. */
    hasFloorLedgeCollison(): boolean {
        return this.includesFlag(CollisionFlag.FloorStartLedge)
            || this.includesFlag(CollisionFlag.FloorEndLedge);
    }
    /** Returns true if any ceiling ledge bit is set. */
    hasCeilingLedgeCollison(): boolean {
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
    hasLedgeCollison(): boolean {
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
    unsetLedge(): void {
        this.unsetFlag(CollisionFlag.AllLedges);
    }

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
