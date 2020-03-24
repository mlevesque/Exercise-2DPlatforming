import { IMainState } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { IVector, createVector, areVectorsEqual } from "../../utils/geometry";
import { actionSetGravity, actionSetAttachSegmentEnabled, actionShowPartition, actionShowCollisionSegment, 
    actionShowEntityCollisions, actionSetPartitionCellSize } from "../../redux/actionCreators";
import { Dispatch } from "redux";
import { VectorComponent, VectorComponentEvent } from "./VectorComponent";

interface IProps {
    gravity: IVector;
    cellWidth: number;
    cellHeight: number;
    mapWidth: number;
    mapHeight: number;
    showPartition: boolean;
    enableSegAttach: boolean;
    showCollisionSegments: boolean;
    showEntityCollisions: boolean;
}

interface IDispatchActions {
    actionSetGravity: (gravity: IVector) => void;
    actionSetPartitionCellSize: (width: number, height: number) => void;
    actionShowPartition: (value: boolean) => void;
    actionSetEnableSegAttach: (value: boolean) => void;
    actionShowCollisionSegments: (value: boolean) => void;
    actionShowEntityCollisions: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    gravity: IVector;
    enablePartition: boolean;
    cellWidth: number;
    cellHeight: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        gravity: state.physics.gravity,
        cellWidth: state.physics.partitionCellWidth,
        cellHeight: state.physics.partitionCellHeight,
        mapWidth: state.map ? state.map.width : 0,
        mapHeight: state.map ? state.map.height : 0,
        showPartition: state.renderConfig.enablePartition,
        enableSegAttach: state.physics.segmentAttachEnabled,
        showCollisionSegments: state.renderConfig.enableCollisionSegments,
        showEntityCollisions: state.renderConfig.enableEntityCollisions,
    };
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
      actionSetGravity: (gravity: IVector) => dispatch(actionSetGravity(gravity)),
      actionSetPartitionCellSize:(width: number, height: number) => dispatch(actionSetPartitionCellSize(width, height)),
      actionShowPartition: (value: boolean) => dispatch(actionShowPartition(value)),
      actionSetEnableSegAttach: (value: boolean) => dispatch(actionSetAttachSegmentEnabled(value)),
      actionShowCollisionSegments: (value: boolean) => dispatch(actionShowCollisionSegment(value)),
      actionShowEntityCollisions: (value: boolean) => dispatch(actionShowEntityCollisions(value)),
    };
  }

class PhysicsConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            gravity: props.gravity,
            enablePartition: true,
            cellWidth: props.cellWidth,
            cellHeight: props.cellHeight,
        };

        this.onGravityChange = this.onGravityChange.bind(this);
        this.applyGravity = this.applyGravity.bind(this);
        this.onPartitionEnableChanged = this.onPartitionEnableChanged.bind(this);
        this.onPartitionCellSizeChanged = this.onPartitionCellSizeChanged.bind(this);
        this.applyPartition = this.applyPartition.bind(this);
    }

    onGravityChange(event: VectorComponentEvent) {
        this.setState({
            gravity: event.value,
        });
    }

    applyGravity() {
        this.props.actionSetGravity(this.state.gravity);
    }

    onPartitionEnableChanged(event: React.FormEvent<HTMLInputElement>) {
        const checked = event.currentTarget.checked;
        const width = checked ? this.state.cellWidth : this.props.mapWidth;
        const height = checked ? this.state.cellHeight : this.props.mapHeight;
        this.props.actionSetPartitionCellSize(width, height);
        this.setState({
            enablePartition: checked,
        });
    }

    onPartitionCellSizeChanged(event: VectorComponentEvent) {
        this.setState({
            cellWidth: Math.floor(event.value.x),
            cellHeight: Math.floor(event.value.y),
        });
    }

    applyPartition() {
        this.props.actionSetPartitionCellSize(this.state.cellWidth, this.state.cellHeight);
    }

    componentWillUpdate(nextProps: Readonly<IFullProps>, nextState: Readonly<IState>) {
        const shouldUpdate = !areVectorsEqual(nextProps.gravity, this.props.gravity)
            || nextProps.cellWidth != this.props.cellWidth || nextProps.cellHeight != this.props.cellHeight;
        if (shouldUpdate) {
            this.setState({
                gravity: nextProps.gravity,
                cellWidth: nextState.enablePartition ? nextProps.cellWidth : nextState.cellWidth,
                cellHeight: nextState.enablePartition ? nextProps.cellHeight : nextState.cellHeight,
            });
        }
    }

    render() {
        return (
            <div>
                {/* GRAVITY */}
                <div className="entry">
                    <h1>Gravity:</h1>
                    <VectorComponent onChange={this.onGravityChange} value={this.state.gravity} />
                    <span style={{width:"10px"}} />
                    <button onClick={this.applyGravity} >Apply</button>
                    <span style={{width:"10px"}} />
                    <button onClick={() => {}} >Reset</button>
                </div>
                <br />

                {/* PARTITION */}
                <div className="entry">
                    <h1>World Partition:</h1>
                    <input 
                        type="checkbox" 
                        name="enablePartition" 
                        checked={this.state.enablePartition}
                        onChange={this.onPartitionEnableChanged} />
                    <label>Enable Partition</label>
                    <br />
                    <span style={{width:"10px"}} />
                    <VectorComponent 
                        disabled={!this.state.enablePartition}
                        xLabel="w" yLabel="h"
                        onChange={this.onPartitionCellSizeChanged} 
                        value={createVector(this.state.cellWidth, this.state.cellHeight)} />
                    <span style={{width:"10px"}} />
                    <button disabled={!this.state.enablePartition} onClick={this.applyPartition} >Apply</button>
                    <span style={{width:"10px"}} />
                    <button disabled={!this.state.enablePartition} onClick={() => {}} >Reset</button>
                    <br />
                    <input 
                        type="checkbox" 
                        name="showPartition" 
                        checked={this.props.showPartition}
                        onChange={e => this.props.actionShowPartition(e.currentTarget.checked)} />
                    <label>Show Partition Cells</label>
                </div>
                <br />

                {/* SEGMENT ATTACHMENT */}
                <div className="entry">
                    <input 
                        type="checkbox" 
                        name="enableSegmentAttachment" 
                        checked={this.props.enableSegAttach}
                        onChange={e => this.props.actionSetEnableSegAttach(e.currentTarget.checked)} />
                    <label>Enable Segment Attachment</label>
                </div>
                <br />

                {/* SHOW COLLISION SEGMENTS */}
                <div className="entry">
                    <input 
                        type="checkbox" 
                        name="showCollisionSegments" 
                        checked={this.props.showCollisionSegments}
                        onChange={e => this.props.actionShowCollisionSegments(e.currentTarget.checked)} />
                    <label>Show Collision Segments</label>
                </div>
                {/* SHOW ENTITY COLLISIONS */}
                <div className="entry">
                    <input 
                        type="checkbox" 
                        name="showEntityCollisions" 
                        checked={this.props.showEntityCollisions}
                        onChange={e => this.props.actionShowEntityCollisions(e.currentTarget.checked)} />
                    <label>Show Entity Collisions</label>
                </div>
            </div>
        )
    }
}

export const PhysicsConfigCom = connect(mapStateToProps, mapDispatchToProps)(PhysicsConfigComponent);
