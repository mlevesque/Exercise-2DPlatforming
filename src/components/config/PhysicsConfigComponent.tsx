import React from "react";
import { PartitionConfigCom } from "./subcomponents/PartitionConfigComponent";
import { CollisionSegmentsConfigCom } from "./subcomponents/CollisionSegmentsConfigComponent";
import { GravityConfigCom } from "./subcomponents/GravityConfigComponent";

export class PhysicsConfigComponent extends React.Component {
    render() {
        return (
            <div>
                <GravityConfigCom/>
                <hr style={{height:"1px", borderWidth:0, color:"#ccc", backgroundColor:"#ccc"}}/>
                <PartitionConfigCom/>
                <hr/>
                <CollisionSegmentsConfigCom/>
            </div>
        )
    }
}
