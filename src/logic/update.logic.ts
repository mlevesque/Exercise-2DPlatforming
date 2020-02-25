import { getCopiedEntitiesSelector, getInputActionsSelector, ICopiedEntityCollection } from "./selectors";
import { select, put, call } from "redux-saga/effects";
import { createSetEntitiesCollectionAction } from "../actions/entities.actions";
import { updateAnimations } from "./animation.logic";
import { updatePlayerActions, preUpdateInput } from "./input.logic";
import { updateMovementSaga } from "./movement.logic";
import { performWorldCollisionsSaga } from "./worldCollisions.logic";

export function* updateSaga(deltaT: number) {
    // check for reset input
    let inputActions = yield select(getInputActionsSelector);
    yield call(preUpdateInput, deltaT, inputActions);

    // we make a copy of all entities to update on
    let entityCollectionCopy: ICopiedEntityCollection = yield select(getCopiedEntitiesSelector);

    // player input
    yield call(updatePlayerActions, deltaT, entityCollectionCopy.player, inputActions);

    // physics
    yield call(updateMovementSaga, deltaT, entityCollectionCopy.allEntities);
    yield call(performWorldCollisionsSaga, deltaT, entityCollectionCopy.allEntities);

    // animation
    yield call(updateAnimations, deltaT, entityCollectionCopy.allEntities);

    // we will then save the updated entities to the store
    yield put(createSetEntitiesCollectionAction(entityCollectionCopy.allEntities));
}
