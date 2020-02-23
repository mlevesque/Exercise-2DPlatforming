import { AnyAction } from "redux";

/**
 * General game actions.
 */
export enum GameAction {
    Update = 'UPDATE',
}

/**
 * Action Creators
 */
export function createGameUpdateAction(deltaTime: number): AnyAction {
    return { type: GameAction.Update, payload: deltaTime };
}
