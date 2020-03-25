import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionSetPartitionCellSize, actionShowPartition } from "../../../redux/actionCreators";
import React from "react";
import { VectorComponent, VectorComponentEvent } from "./VectorComponent";
import { createVector } from "../../../utils/geometry";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";

interface IProps {
    cellWidth: number;
    cellHeight: number;
    mapWidth: number;
    mapHeight: number;
    showPartition: boolean;
}

interface IDispatchActions {
    actionSetPartitionCellSize: (width: number, height: number) => void;
    actionShowPartition: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    enablePartition: boolean;
    cellWidth: number;
    cellHeight: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        cellWidth: state.physics.partitionCellWidth,
        cellHeight: state.physics.partitionCellHeight,
        mapWidth: state.map ? state.map.width : 0,
        mapHeight: state.map ? state.map.height : 0,
        showPartition: state.renderConfig.enablePartition,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetPartitionCellSize: (width: number, height: number) => dispatch(actionSetPartitionCellSize(width, height)),
        actionShowPartition: (value: boolean) => dispatch(actionShowPartition(value)),
    }
}

class PartitionConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            enablePartition: true,
            cellWidth: props.cellWidth,
            cellHeight: props.cellHeight,
        };

        this.onPartitionEnableChanged = this.onPartitionEnableChanged.bind(this);
        this.onPartitionCellSizeChanged = this.onPartitionCellSizeChanged.bind(this);
        this.applyPartition = this.applyPartition.bind(this);
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

    render() {
        return (
            <div className="entry">
                <h1>World Partition:</h1>
                <input 
                    type="checkbox" 
                    name="enablePartition" 
                    checked={this.state.enablePartition}
                    onChange={this.onPartitionEnableChanged} />
                <label htmlFor="enablePartition">Enable Partition</label>
                <br />
                <span className="space"/>
                <VectorComponent 
                    disabled={!this.state.enablePartition}
                    xLabel="w" yLabel="h"
                    onChange={this.onPartitionCellSizeChanged} 
                    value={createVector(this.state.cellWidth, this.state.cellHeight)} />
                <span className="space"/>
                <button disabled={!this.state.enablePartition} onClick={this.applyPartition} >Apply</button>
                <span className="space"/>
                <button disabled={!this.state.enablePartition} onClick={() => {}} >Reset</button>
                <br />
                <input 
                    type="checkbox" 
                    name="showPartition" 
                    checked={this.props.showPartition}
                    onChange={e => this.props.actionShowPartition(e.currentTarget.checked)} />
                <label htmlFor="showPartition">Show Partition Cells</label>
            </div>
        );
    }
}

export const PartitionConfigCom = connect(mapStateToProps, mapDispatchToProps)(PartitionConfigComponent);
