import { select, put } from "redux-saga/effects";
import { getLoadingSelector, getLevelName } from "../redux/selectors";
import { isKeyPressed, isKeyDown } from "./utils";
import { InputType, IInputActions } from "../redux/state";
import { GameEventQueue } from "../events/GameEventQueue";
import { InputActionEvent } from "../events/GameEvents";
import { actionLoadLevel } from "../redux/actionCreators";
import { MoveDirection } from "../behaviors/BehaviorComponents";
import { IEntity } from "../entities/IEntity";

/**
 * Generator function for updating player input actions and affecting the player entity.
 * @param deltaT Frame time.
 * @param player Player entity.
 * @param inputActions Recorded input actions from the redux store.
 */
export function* updatePlayerActions(deltaT: number, player: IEntity, inputActions: IInputActions) {
    // don't do player input if scene is loading
    let loading = yield select(getLoadingSelector);
    if (loading) {
        return;
    }

    let goLeft = isKeyDown(InputType.Left, inputActions);
    let goRight = isKeyDown(InputType.Right, inputActions);
    let jump = isKeyDown(InputType.Jump, inputActions);
    const eventQueue = GameEventQueue.getInstance();

    if (goLeft && !goRight) {
        eventQueue.addToQueue(player.id, new InputActionEvent(MoveDirection.Left, jump));

    }
    else if (goRight && !goLeft) {
        eventQueue.addToQueue(player.id, new InputActionEvent(MoveDirection.Right, jump));
    }
    else {
        eventQueue.addToQueue(player.id, new InputActionEvent(MoveDirection.None, jump));
    }
}

/**
 * Generator function for performing input checks after all other updates happen. This is in place so that the player
 * can press a key to reset the scene.
 * @param deltaT 
 * @param inputActions 
 */
export function* postUpdateInput(deltaT: number, inputActions: IInputActions) {
    if (isKeyPressed(InputType.Reset, inputActions)) {
        const level: string = yield select(getLevelName);
        yield put(actionLoadLevel(level));
    }
}
