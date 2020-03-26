import { Store, AnyAction } from "redux";
import { actionGameUpdate, actionUpdateInput, actionSetEntitiesCollection, actionSetProfile } 
    from "./redux/actionCreators";
import { select, call, put, takeEvery } from "redux-saga/effects";
import { getLoadingSelector, getInputActionsSelector, getProfile } from "./redux/selectors";
import { GameAction } from "./redux/actionTypes";
import { updatePlayerActions, postUpdateInput } from "./input/updateSaga";
import { updateMovementSaga, performWorldCollisionsSaga } from "./physics/updateSaga";
import { updateAnimations } from "./animation/updateSaga";
import { renderSaga, renderLoadingSaga } from "./render/updateSaga";
import { GameEventQueue } from "./events/GameEventQueue";
import { updateReactionBehaviors, updateActionBehaviors } from "./behaviors/updateSaga";
import { updateCamera } from "./camera/updateSaga";
import { IProfileData, IEntity } from "./redux/state";
import { EntityCollection } from "./entities/EntityCollection";

/**
 * Main game loop.
 * @param deltaT 
 */
function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    const entityCollection = EntityCollection.getInstance();
    const entities = entityCollection.getAllEntities();
    const player = entityCollection.getPlayer();

    // reset the event queue
    GameEventQueue.getInstance().resetEntireQueue();

    // player input
    let inputActions = yield select(getInputActionsSelector);
    yield call(updatePlayerActions, deltaT, player, inputActions);

    // get profile data
    let profile: IProfileData = yield select(getProfile);
    profile.frameTime = deltaT;

    // action behaviors
    let t = performance.now();
    yield call(updateActionBehaviors, deltaT, entities);
    profile.behaviorActionTime = performance.now() - t;

    // physics
    t = performance.now();
    yield call(updateMovementSaga, deltaT, entities);
    yield call(performWorldCollisionsSaga, deltaT, entities);
    profile.physicsTime = performance.now() - t;

    // reaction behaviors
    t = performance.now();
    yield call(updateReactionBehaviors, deltaT, entities);
    profile.behaviorReactionTime = performance.now() - t;

    // animation
    t = performance.now();
    yield call(updateAnimations, deltaT, entities);
    profile.animationTime = performance.now() - t;

    // camera
    yield call(updateCamera, deltaT, player.positionData.position);

    // perform post update input
    yield call(postUpdateInput, deltaT, inputActions);

    // render
    t = performance.now();
    yield call(renderSaga, deltaT);
    profile.renderTime = performance.now() - t;
    
    // save profile data
    yield put(actionSetProfile(profile));

    // shift key input set flags from current to previous
    yield put(actionUpdateInput());
}

/**
 * Calls the gameloop for every Update action.
 * @param action 
 */
function* gameloopUpdateSaga(action: AnyAction) {
    // only update when we are not loading
    const deltaT: number = action.payload;
    const loading = yield select(getLoadingSelector);
    if (loading) {
        yield call(renderLoadingSaga, deltaT);
    }
    else {
        yield call(updateSaga, deltaT);
    }
}

/**
 * Initiates the gameloop.
 */
export function* gameloopInitSaga() {
    yield takeEvery(GameAction.Update, gameloopUpdateSaga);
}

/**
 * Sets up the game update loop for each window animation frame update.
 * @param store 
 */
export function initiateGameUpdates(store: Store<any, AnyAction>) {
    let prevTimestamp: number = 0;
    function update(timeStamp: number): void {
        let dt: number = timeStamp - prevTimestamp;
        store.dispatch(actionGameUpdate(dt));
        prevTimestamp = timeStamp;
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
}
