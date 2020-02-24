import { getCopiedEntities, getCopiedPlayer, getInputActions } from "./selectors";
import { select, put, call } from "redux-saga/effects";
import { createSetEntitiesCollectionAction, createSetPlayerAction } from "../actions/entities.actions";
import { updateAnimations } from "./animation.logic";
import { updatePlayerActions } from "./input.logic";

export function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    let entityCollectionCopy = yield select(getCopiedEntities);
    let player = yield select(getCopiedPlayer);

    // player input
    let inputActions = yield select(getInputActions);
    yield call(updatePlayerActions, deltaT, player, inputActions);

    // animation
    yield call(updateAnimations, deltaT, [player]);
    yield call(updateAnimations, deltaT, entityCollectionCopy);

    // we will then save the updated entities to the store
    yield put(createSetEntitiesCollectionAction(entityCollectionCopy));
    yield put(createSetPlayerAction(player));
}
