import { GameEvent } from "./GameEvents";

export class GameEventQueue {
    private static _instance: GameEventQueue;

    private _queueMap: Map<string, GameEvent[]>;

    private constructor() {
        this.resetEntireQueue();
    }

    static getInstance(): GameEventQueue {
        if (!this._instance) {
            this._instance = new GameEventQueue();
        }
        return this._instance;
    }

    addToQueue(id: string, event: GameEvent): void {
        if (!this._queueMap.has(id)) {
            this._queueMap.set(id, []);
        }
        this._queueMap.get(id).push(event);
    }

    getQueueForId(id: string): GameEvent[] {
        if (this._queueMap.has(id)) {
            return this._queueMap.get(id);
        }
        return [];
    }

    clearQueueForId(id: string): void {
        this._queueMap.delete(id);
    }

    resetEntireQueue(): void {
        this._queueMap = new Map<string, GameEvent[]>();
    }
}
