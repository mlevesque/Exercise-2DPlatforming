import { combineReducers } from 'redux'
import { IMainState } from '../model/IMainState';
import { inputReducer } from './input.reducer';
import { cameraReducer } from './camera.reducer';

const allReducers = combineReducers<IMainState>({
    input: inputReducer,
    camera: cameraReducer,
});

export default allReducers;
