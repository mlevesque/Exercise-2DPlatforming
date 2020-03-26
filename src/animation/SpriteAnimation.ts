import { IAnimationMappingSchema, IAnimationSchema } from "./JsonSchema";
import { isUndefined } from "util";

class SpriteAnimation implements ISpriteAnimation {
    private readonly _entityId: string;
    private readonly _spritesheet: string;
    private readonly _schema: IAnimationMappingSchema;
    private _queue: EntityAnimation[];
    private _flipped: boolean;
    private _currentAnimation: EntityAnimation;
    private _currentAnimationSchema: IAnimationSchema;
    private _currentFrame: number;
    private _elapsedTime: number;

    private shouldChangeAnimationFrame(): boolean {
        return this._currentAnimationSchema 
            && this._elapsedTime > this._currentAnimationSchema.intervals[this._currentFrame];
    }

    private getFrameTimeInterval(): number {
        let result = this._currentAnimationSchema.intervals[this._currentFrame];
        return isUndefined(result) ? 1 : result;
    }

    constructor(entityId: string, spritesheet: string, animationMappingSchema: IAnimationMappingSchema) {
        this._entityId = entityId;
        this._spritesheet = spritesheet;
        this._schema = animationMappingSchema;
        this._queue = [];
        this.setAnimation(EntityAnimation.Idle, true);
    }

    public get entityId(): string {return this._entityId}
    public get isFlipped(): boolean {return this._flipped}
    public get currentAnimation(): EntityAnimation {return this._currentAnimation}
    public get currentFrame(): number {return this._currentFrame}
    public get spritesheet(): string {return this._spritesheet}

    public setFlip(value: boolean): void {this._flipped = value}

    public setAnimation(animation: EntityAnimation, restart: boolean = false): void {
        if (animation != this._currentAnimation || restart) {
            this._currentAnimation = animation;
            this._currentAnimationSchema = this._schema[this._currentAnimation];
            this._currentFrame = 0;
            this._elapsedTime = 0;
        }
    }

    public queueAnimation(animation: EntityAnimation): void {
        this._queue.push(animation);
    }

    public clearQueue(): void {
        this._queue = [];
    }

    public update(deltaT: number): void {
        this._elapsedTime += deltaT;
        while (this.shouldChangeAnimationFrame()) {
            // go to next frame
            this._elapsedTime -= this.getFrameTimeInterval();
            this._currentFrame++;

            // have we reached the end of the animation?
            if (this._currentFrame >= this._currentAnimationSchema.frameCount) {
                // if we should loop, then go back to frame 0
                if (this._currentAnimationSchema.loops) {
                    this._currentFrame = 0;
                }

                // otherwise if we have a queue, then set the next animation
                else if (this._queue.length > 0) {
                    this._currentFrame = 0;
                    const nextAnimation = this._queue.shift();
                    this.setAnimation(nextAnimation, false);
                }

                // otherwise, stay at the last frame of the current animation
                else {
                    this._currentFrame = this._currentAnimationSchema.frameCount - 1;
                }
            }
        }
    }

    public getSpriteSlice(): ISpriteSlice {
        const anim = this._currentAnimationSchema;
        if (!anim) {
            return {x: 0, y: 0, w: 0, h: 0, offX: 0, offY: 0};
        }
        return {
            x: anim.x + this._currentFrame * anim.w,
            y: anim.y,
            w: anim.w,
            h: anim.h,
            offX: anim.offX,
            offY: anim.offY
        }
    }
}

export enum EntityAnimation {
    Idle = "idle",
    Walk = "walk",
    Jump = "jump",
    Fall = "fall",
    JumpFall = "jumpFall",
}

export interface ISpriteAnimation {
    readonly entityId: string;
    readonly isFlipped: boolean;
    readonly currentAnimation: EntityAnimation
    readonly currentFrame: number;
    readonly spritesheet: string;
    setFlip(value: boolean): void;
    setAnimation(animation: EntityAnimation, restart: boolean): void;
    queueAnimation(animation: EntityAnimation): void;
    clearQueue(): void;
    update(deltaT: number): void;
    getSpriteSlice(): ISpriteSlice;
}

export interface ISpriteSlice {
    x: number;
    y: number;
    w: number;
    h: number;
    offX: number;
    offY: number;
}

export function buildSpriteAnimation(
                    entityId: string, spritesheet: string, mappingSchema: IAnimationMappingSchema): ISpriteAnimation {
    return new SpriteAnimation(entityId, spritesheet, mappingSchema);
}
