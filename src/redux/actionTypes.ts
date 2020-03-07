export enum GameAction {
    Update = 'GameAction.Update',
}

export enum CameraAction {
    Resize = "CameraAction.Resize",
    SetPosition = "CameraAction.SetPosition",
}

export enum CollisionsAction {
    SetStatic = "CollisionsAction.SetStatic",
    Clear = "CollisionsAction.Clear",
}

export enum EntitiesAction {
    SetCollection = "EntitiesAction.SetCollection",
    Clear = "EntitiesAction.Clear",
}

export enum InputAction {
    Set = 'InputAction.Set',
    Update = 'InputAction.Update',
}

export enum LoadingAction {
    SetFlag = "LoadingAction.SetFlag",
}

export enum MapAction {
    Set = "MapAction.Set",
    Clear = "MapAction.Clear",
}
