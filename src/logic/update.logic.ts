import { getCopiedEntitiesSelector, getInputActionsSelector, ICopiedEntityCollection } from "./selectors";
import { select, put, call } from "redux-saga/effects";
import { createSetEntitiesCollectionAction } from "../actions/entities.actions";
import { updateAnimations } from "./animation.logic";
import { updatePlayerActions, postUpdateInput } from "./input.logic";
import { updateMovementSaga } from "./physics/movement.logic";
import { performWorldCollisionsSaga } from "./physics/worldCollisions.logic";

export function* updateSaga(deltaT: number) {
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
    yield put(createSetEntitiesCollectionAction(entityCollectionCopy.allEntities));

    // perform post update input
    yield call(postUpdateInput, deltaT, inputActions);
}
