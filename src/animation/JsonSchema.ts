export interface IAnimationMappingSchema {
    [id: string]: IAnimationSchema;
}

export interface IAnimationSchema {
    loops: boolean;
    frameCount: number;
    x: number;
    y: number;
    w: number;
    h: number;
    offX: number;
    offY: number;
    intervals: number[];
}
