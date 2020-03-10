import { Store, AnyAction } from "redux";
import { actionGameUpdate, actionUpdateInput, actionSetEntitiesCollection, actionSetProfile } from "./redux/actionCreators";
import { select, call, put, takeEvery } from "redux-saga/effects";
import { getLoadingSelector, ICopiedEntityCollection, getCopiedEntitiesSelector, getInputActionsSelector, getProfile } 
    from "./redux/selectors";
import { GameAction } from "./redux/actionTypes";
import { updatePlayerActions, postUpdateInput } from "./input/updateSaga";
import { updateMovementSaga, performWorldCollisionsSaga } from "./physics/updateSaga";
import { updateAnimations } from "./animation/updateSaga";
import { renderSaga } from "./render/updateSaga";
import { GameEventQueue } from "./events/GameEventQueue";
import { updateReactionBehaviors, updateActionBehaviors } from "./behaviors/updateSaga";
import { updateCamera } from "./camera/updateSaga";
import { IProfileData } from "./redux/state";

function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    let entityCollectionCopy: ICopiedEntityCollection = yield select(getCopiedEntitiesSelector);

    // reset the event queue
    GameEventQueue.getInstance().resetEntireQueue();

    // player input
    let inputActions = yield select(getInputActionsSelector);
    yield call(updatePlayerActions, deltaT, entityCollectionCopy.player, inputActions);

    // get profile data
    let profile: IProfileData = yield select(getProfile);
    profile.frameTime = deltaT;

    // action behaviors
    let t = performance.now();
    yield call(updateActionBehaviors, deltaT, entityCollectionCopy.allEntities);
    profile.behaviorActionTime = performance.now() - t;

    // physics
    t = performance.now();
    yield call(updateMovementSaga, deltaT, entityCollectionCopy.allEntities);
    yield call(performWorldCollisionsSaga, deltaT, entityCollectionCopy.allEntities);
    profile.physicsTime = performance.now() - t;

    // reaction behaviors
    t = performance.now();
    yield call(updateReactionBehaviors, deltaT, entityCollectionCopy.allEntities);
    profile.behaviorReactionTime = performance.now() - t;

    // animation
    t = performance.now();
    yield call(updateAnimations, deltaT, entityCollectionCopy.allEntities);
    profile.animationTime = performance.now() - t;

    // camera
    yield call(updateCamera, deltaT, entityCollectionCopy.player.positionData.position);

    // we will then save the updated entities to the store
    yield put(actionSetEntitiesCollection(entityCollectionCopy.allEntities));

    // perform post update input
    yield call(postUpdateInput, deltaT, inputActions);

    // save profile data
    yield put(actionSetProfile(profile));
}

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

function* gameloopUpdateSaga(action: AnyAction) {
    // update
    // only update when we are not loading
    const deltaT: number = action.payload;
    const loading = yield select(getLoadingSelector);
    if (!loading) {
        yield call(updateSaga, deltaT);
    }

    // render
    let profile: IProfileData = yield select(getProfile);
    let t = performance.now();
    yield call(renderSaga, deltaT);
    profile.renderTime = performance.now() - t;
    yield put(actionSetProfile(profile));

    // shift key input set flags from current to previous
    yield put(actionUpdateInput());
}

export function* gameloopInitSaga() {
    yield takeEvery(GameAction.Update, gameloopUpdateSaga);
}
