import React from "react";
import { PartitionConfigCom } from "./subcomponents/PartitionConfigComponent";
import { CollisionSegmentsConfigCom } from "./subcomponents/CollisionSegmentsConfigComponent";
import { GravityConfigCom } from "./subcomponents/GravityConfigComponent";
import { EntityCollisionsConfigCom } from "./subcomponents/EntityCollisionsConfigComponent";

export class PhysicsConfigComponent extends React.Component {
    render() {
        return (
            <div>
                <GravityConfigCom/>
                <hr/>
                <PartitionConfigCom/>
                <hr/>
                <CollisionSegmentsConfigCom/>
                <hr/>
                <EntityCollisionsConfigCom/>
            </div>
        )
    }
}
