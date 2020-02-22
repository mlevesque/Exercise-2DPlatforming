import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from 'react-redux';
import { createStore, Store, applyMiddleware } from "redux";
import MainComponent from "./components/MainComponent";
import createSagaMiddleware from "@redux-saga/core";
import allReducers from "./reducers/main.reducer";
import { InitialState } from "./reducers/InitialState";

const sagaMiddleware = createSagaMiddleware();
const store: Store = createStore(allReducers, InitialState, applyMiddleware(sagaMiddleware));

ReactDOM.render(
    <Provider store={store}>
        <MainComponent />
    </Provider>,
    document.getElementById("main")
);