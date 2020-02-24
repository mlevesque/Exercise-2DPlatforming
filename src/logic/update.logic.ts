import { getCopiedEntities } from "./selectors";
import { select, put } from "redux-saga/effects";
import { createSetEntitiesAction } from "../actions/entities.actions";

export function* updateSaga(deltaT: number) {
    // we make a copy of all entities to update on
    let entityCollectionCopy = yield select(getCopiedEntities);

    // we will then save the updated entities to the store
    yield put(createSetEntitiesAction(entityCollectionCopy));
}
