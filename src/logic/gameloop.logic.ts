import { put, takeEvery, call } from "redux-saga/effects";
import { createUpdateInputAction } from "../actions/input.actions";
import { GameAction, createGameUpdateAction } from "../actions/game.actions";
import { Store, AnyAction } from "redux";
import { renderSaga } from "./render.logic";
import { updateSaga } from "./update.logic";

let prevTimestamp: number = 0;
export function initiateGameUpdates(store: Store<any, AnyAction>) {
    function update(timeStamp: number): void {
        let dt: number = timeStamp - prevTimestamp;
        store.dispatch(createGameUpdateAction(dt));
        prevTimestamp = timeStamp;
        window.requestAnimationFrame(update);
    }
    window.requestAnimationFrame(update);
}

function* gameloopUpdateSaga(action: AnyAction) {
    const deltaT: number = action.payload;
    yield put(createUpdateInputAction());
    yield call(updateSaga, deltaT);
    yield call(renderSaga);
}

export function* gameloopInitSaga() {
    yield takeEvery(GameAction.Update, gameloopUpdateSaga);
}
