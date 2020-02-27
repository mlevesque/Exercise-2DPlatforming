import { loadLevelSaga } from "../loading/updateSaga";
import { select, fork } from "redux-saga/effects";
import { getLoadingSelector } from "../redux/selectors";
import { getEntityJsonData } from "../utils/jsonSchemas";
import { isKeyPressed, isKeyDown, applyImpulseToEntity, clearImpulseOnEntity } from "./utils";
import { InputType, IEntity, IInputActions, EntityType, EntityAnimation } from "../redux/state";
import { changeAnimationOnEntity } from "../behaviors/utils";

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

    let playerData = getEntityJsonData(EntityType.Player);
    let goLeft = isKeyDown(InputType.Left, inputActions);
    let goRight = isKeyDown(InputType.Right, inputActions);

    if (goLeft && !goRight) {
        player.flip = true;
        changeAnimationOnEntity(player, EntityAnimation.Walk, false);
        applyImpulseToEntity(player, {x: -playerData.speed, y: 0});
    }
    else if (goRight && !goLeft) {
        player.flip = false;
        changeAnimationOnEntity(player, EntityAnimation.Walk, false);
        applyImpulseToEntity(player, {x: playerData.speed, y: 0});
    }
    else {
        changeAnimationOnEntity(player, EntityAnimation.Idle, false);
        clearImpulseOnEntity(player);
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
        yield fork(loadLevelSaga, "map_01.json");
    }
}
