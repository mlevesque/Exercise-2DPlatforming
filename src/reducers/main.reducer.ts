import { combineReducers } from 'redux'
import { IMainState } from '../model/IMainState';
import { inputReducer } from './input.reducer';

const allReducers = combineReducers<IMainState>({
    input: inputReducer,
});

export default allReducers;
