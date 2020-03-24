import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { createStore, Store, applyMiddleware } from "redux";
import MainComponent from "./components/MainComponent";
import createSagaMiddleware from "@redux-saga/core";
import allReducers from "./redux/reducers";
import { InitState } from "./redux/InitState";
import { fork, call, put } from "redux-saga/effects";
import { loadLevelInitSaga } from "./loading/loadLevelSaga";
import { setupInputListener } from "./input/setup";
import { gameloopInitSaga, initiateGameUpdates } from "./gameloop";
import { actionLoadLevel } from "./redux/actionCreators";
import { resetSagas } from "./loading/resetSaga";

// setup redux
const sagaMiddleware = createSagaMiddleware();
const store: Store = createStore(allReducers, InitState, applyMiddleware(sagaMiddleware));

// setup react components
ReactDOM.render(
    <Provider store={store}>
        <MainComponent />
    </Provider>,
    document.getElementById("main")
);

// Setup input listening
setupInputListener(store, "keydown", true);
setupInputListener(store, "keyup", false);

// Setup game updates
function* rootSaga() {
    yield fork(loadLevelInitSaga);
    yield fork(gameloopInitSaga);
    yield fork(resetSagas);
    yield put(actionLoadLevel("map_01"));
}
sagaMiddleware.run(rootSaga);
initiateGameUpdates(store);
