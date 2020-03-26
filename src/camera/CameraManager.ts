import { ICamera } from "./Camera";

export class CameraManager {
    private _activeCamera: ICamera;

    private static _instance: CameraManager = null;

    private constructor() {}

    public static getInstance(): CameraManager {
        if (!this._instance) {
            this._instance = new CameraManager();
        }
        return this._instance;
    }

    public get activeCamera(): ICamera {return this._activeCamera}

    public setActiveCamera(cam: ICamera): void {this._activeCamera = cam}
}
