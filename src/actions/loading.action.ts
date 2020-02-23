import { AnyAction } from "redux";

export enum LoadingAction {
    SetFlag = "LoadingAction.SetFlag",
}

export function createSetLoadingFlagAction(flag: boolean): AnyAction {
    return {type: LoadingAction.SetFlag, payload: flag};
}
