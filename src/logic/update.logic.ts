import { getCopiedEntitiesSelector, getCopiedPlayerSelector, getInputActionsSelector } from "./selectors";
import { select, put, call } from "redux-saga/effects";
import { createSetEntitiesCollectionAction, createSetPlayerAction } from "../actions/entities.actions";
import { updateAnimations } from "./animation.logic";
import { updatePlayerActions, preUpdateInput } from "./input.logic";

export function* updateSaga(deltaT: number) {
    // check for reset input
    let inputActions = yield select(getInputActionsSelector);
    yield call(preUpdateInput, deltaT, inputActions);

    // we make a copy of all entities to update on
    let entityCollectionCopy = yield select(getCopiedEntitiesSelector);
    let player = yield select(getCopiedPlayerSelector);

    // player input
    yield call(updatePlayerActions, deltaT, player, inputActions);

    // animation
    yield call(updateAnimations, deltaT, [player]);
    yield call(updateAnimations, deltaT, entityCollectionCopy);

    // we will then save the updated entities to the store
    yield put(createSetEntitiesCollectionAction(entityCollectionCopy));
    yield put(createSetPlayerAction(player));
}
