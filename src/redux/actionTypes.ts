export enum GameAction {
    Load = "GameAction.Load",
    Update = 'GameAction.Update',
}

export enum CameraAction {
    Resize = "CameraAction.Resize",
    SetLocks = "CameraAction.SetLocks",
    SetScrollArea = "CameraAction.SetScrollArea",
}

export enum PhysicsConfigAction {
    SetGravity = "PhysicsConfigAction.SetGravity",
    ResetGravity = "PhysicsConfigAction.ResetGravity",
    SetAttachSegmentEnabled = "PhysicsConfigAction.SetAttachSegmentEnabled",
    SetPartitionCellSize = "PhysicsConfigAction.SetPartitionCellSize",
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

export enum LevelNameAction {
    Set = "LevelNameAction.Set",
}

export enum MapAction {
    Set = "MapAction.Set",
    Clear = "MapAction.Clear",
}

export enum RenderConfigAction {
    SetWhiteFade = "RenderConfigAction.SetWhiteFade",
    SetPartition = "RenderConfigAction.SetPartition",
    SetCollisionSegment = "RenderConfigAction.SetCollisionSegment",
    SetFrameRate = "RenderConfigAction.SetFrameRate",
    SetCameraScroll = "RenderConfigAction.SetCameraScroll",
    SetEntityCollisions = "RenderConfigAction.SetEntityCollisions",
    SetPartitionSegmentId = "RenderConfigAction.SetPartitionSegmentId",
}

export enum ConfigTabAction {
    SetTab = "ConfigTabAction.SetTab",
}

export enum ProfileAction {
    Set = "ProfileAction.Set",
}
