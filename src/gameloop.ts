import { Store, AnyAction } from "redux";
import { actionGameUpdate, actionUpdateInput, actionSetEntitiesCollection } from "./redux/actionCreators";
import { select, call, put, takeEvery } from "redux-saga/effects";
import { getLoadingSelector, 
         ICopiedEntityCollection,
         getCopiedEntitiesSelector,
         getInputActionsSelector } from "./redux/selectors";
import { GameAction } from "./redux/actionTypes";
import { updatePlayerActions, postUpdateInput } from "./input/updateSaga";
import { updateMovementSaga, performWorldCollisionsSaga } from "./physics/updateSaga";
import { updateAnimations } from "./animation/updateSaga";
import { renderSaga } from "./render/updateSaga";

function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    let entityCollectionCopy: ICopiedEntityCollection = yield select(getCopiedEntitiesSelector);

    // player input
    let inputActions = yield select(getInputActionsSelector);
    yield call(updatePlayerActions, deltaT, entityCollectionCopy.player, inputActions);

    // physics
    yield call(updateMovementSaga, deltaT, entityCollectionCopy.allEntities);
    yield call(performWorldCollisionsSaga, deltaT, entityCollectionCopy.allEntities);

    // animation
    yield call(updateAnimations, deltaT, entityCollectionCopy.allEntities);

    // we will then save the updated entities to the store
    yield put(actionSetEntitiesCollection(entityCollectionCopy.allEntities));

    // perform post update input
    yield call(postUpdateInput, deltaT, inputActions);
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
    yield call(renderSaga, deltaT);

    // shift key input set flags from current to previous
    yield put(actionUpdateInput());
}

export function* gameloopInitSaga() {
    yield takeEvery(GameAction.Update, gameloopUpdateSaga);
}
