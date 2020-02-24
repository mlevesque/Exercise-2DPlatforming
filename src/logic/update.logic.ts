import { getCopiedEntities } from "./selectors";
import { select, put, call } from "redux-saga/effects";
import { createSetEntitiesAction } from "../actions/entities.actions";
import { updateAnimations } from "./animation.logic";

export function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    let entityCollectionCopy = yield select(getCopiedEntities);

    // animation
    yield call(updateAnimations, deltaT, entityCollectionCopy);

    // we will then save the updated entities to the store
    yield put(createSetEntitiesAction(entityCollectionCopy));
}
