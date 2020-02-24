import { combineReducers } from 'redux'
import { IMainState } from '../model/IMainState';
import { inputReducer } from './input.reducer';
import { cameraReducer } from './camera.reducer';
import { loadingReducer } from './loading.reducer';
import { mapReducer } from './map.reducer';
import { entitiesReducer } from './entities.reducer';

const allReducers = combineReducers<IMainState>({
    loading: loadingReducer,
    input: inputReducer,
    camera: cameraReducer,
    map: mapReducer,
    entities: entitiesReducer,
});

export default allReducers;
