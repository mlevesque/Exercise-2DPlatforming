import React from "react";
import { ScrollConfigCom } from "./subcomponents/ScrollConfigComponent";
import { ScrollTargetConfigCom } from "./subcomponents/ScrollTargetConfigComponent";

export class CameraConfigComponent extends React.Component {
    render() {
        return (
            <div>
                <ScrollConfigCom/>
                <hr/>
                <ScrollTargetConfigCom/>
            </div>
        )
    }
}
