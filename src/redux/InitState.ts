import { IMainState, InputType, ConfigTab } from "./state";
import { zeroVector } from "../utils/geometry";

export const InitState: IMainState = {
    loading: false,
    input: {
        [InputType.Left]: {previous: false, current: false},
        [InputType.Right]: {previous: false, current: false},
        [InputType.Jump]: {previous: false, current: false},
        [InputType.Reset]: {previous: false, current: false},
    },
    cameraConfig: {
        halfWidth: 320,
        halfHeight: 240,
        lockX: false,
        lockY: false,
        worldConstraints: true,
        radius: 10,
        spring: 100,
        dampen: 20,
        entityTarget: "",
    },
    levelName: "",
    map: null,
    physics: {
        gravity: {x: 0, y: 700},
        originalGravity: {x: 0, y: 700},
        segmentAttachEnabled: true,
        partitionCellWidth: 1,
        partitionCellHeight: 1,
    },
    staticCollisions: [],
    entities: [],
    renderConfig: {
        enableWhiteFade: false,
        enableFrameRate: false,
        enablePartition: false,
        enableCameraScroll: false,
        enableCollisionSegments: false,
        enableEntityCollisions: false,
        enableAttachCollision: false,
        partitionSegmentId: "",
    },
    configTab: ConfigTab.Level,
    profileData: {
        frameTime: 1,
        behaviorActionTime: 0,
        physicsTime: 0,
        behaviorReactionTime: 0,
        animationTime: 0,
        renderTime: 0
    }
}
