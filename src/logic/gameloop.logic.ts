import { put, takeEvery, call, select } from "redux-saga/effects";
import { createUpdateInputAction } from "../actions/input.actions";
import { GameAction, createGameUpdateAction } from "../actions/game.actions";
import { Store, AnyAction } from "redux";
import { renderSaga } from "./render.logic";
import { updateSaga } from "./update.logic";
import { getLoadingSelector } from "./selectors";

export function initiateGameUpdates(store: Store<any, AnyAction>) {
    let prevTimestamp: number = 0;
    function update(timeStamp: number): void {
        let dt: number = timeStamp - prevTimestamp;
        store.dispatch(createGameUpdateAction(dt));
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
    yield put(createUpdateInputAction());
}

export function* gameloopInitSaga() {
    yield takeEvery(GameAction.Update, gameloopUpdateSaga);
}
