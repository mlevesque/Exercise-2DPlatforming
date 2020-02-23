import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { createStore, Store, applyMiddleware } from "redux";
import MainComponent from "./components/MainComponent";
import createSagaMiddleware from "@redux-saga/core";
import allReducers from "./reducers/main.reducer";
import { InitState } from "./reducers/InitState";
import { setupInputListener } from "./logic/input.logic";
import { gameloopInitSaga, initiateGameUpdates } from "./logic/gameloop.logic";
import { fork } from "redux-saga/effects";

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
    yield fork(gameloopInitSaga);
}
sagaMiddleware.run(rootSaga);
initiateGameUpdates(store);
