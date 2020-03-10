import { IMainState } from "../redux/state";
import { select } from "redux-saga/effects";
import { getFullStateSelector } from "../redux/selectors";
import { renderLoading, render } from "./scene";

export function* renderSaga(deltaT: number) {
    const canvas = <HTMLCanvasElement>document.getElementById("gameView");
    const ctx = canvas.getContext("2d");
    const state: IMainState = yield select(getFullStateSelector);
    render(ctx, deltaT, state);
}

export function* renderLoadingSaga(deltaT: number) {
    const canvas = <HTMLCanvasElement>document.getElementById("gameView");
    const ctx = canvas.getContext("2d");
    renderLoading(ctx);
}
