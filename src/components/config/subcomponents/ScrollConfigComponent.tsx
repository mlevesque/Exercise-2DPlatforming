import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionCameraSetScrollArea, actionShowCameraScroll, actionCameraSetLocks, 
    actionCameraSetWorldConstraints } from "../../../redux/actionCreators";
import React from "react";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";
import { VectorComponent } from "./VectorComponent";
import { createVector } from "../../../utils/geometry";

interface IProps {
    lockX: boolean;
    lockY: boolean;
    constrainToWorld: boolean;
    radius: number;
    spring: number;
    dampen: number;
    showScroll: boolean;
}

interface IDispatchActions {
    actionSetCameraLocks: (x: boolean, y: boolean) => void;
    actionSetScrollArea: (radius: number, spring: number, dampen: number) => void;
    actionShowCameraScroll: (value: boolean) => void;
    actionSetWorldConstraints: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    radius: number;
    spring: number;
    dampen: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        lockX: state.cameraConfig.lockX,
        lockY: state.cameraConfig.lockY,
        constrainToWorld: state.cameraConfig.worldConstraints,
        radius: state.cameraConfig.radius,
        spring: state.cameraConfig.spring,
        dampen: state.cameraConfig.dampen,
        showScroll: state.renderConfig.enableCameraScroll,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetCameraLocks: (x: boolean, y: boolean) => dispatch(actionCameraSetLocks(x, y)),
        actionSetScrollArea: (radius: number, spring: number, dampen: number) => 
            dispatch(actionCameraSetScrollArea(radius, spring, dampen)),
        actionShowCameraScroll: (value: boolean) => dispatch(actionShowCameraScroll(value)),
        actionSetWorldConstraints: (value: boolean) => dispatch(actionCameraSetWorldConstraints(value)),
    }
}

class ScrollConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            radius: props.radius,
            spring: props.spring,
            dampen: props.dampen,
        };

        this.applyScrollArea = this.applyScrollArea.bind(this);
    }

    applyScrollArea() {
        this.props.actionSetScrollArea(this.state.radius, this.state.spring, this.state.dampen);
    }

    componentWillUpdate(nextProps: Readonly<IProps>) {
        if (this.props.radius != nextProps.radius 
            || this.props.spring != nextProps.spring 
            || this.props.dampen != nextProps.dampen) {
            this.setState({
                radius: nextProps.radius,
                spring: nextProps.spring,
                dampen: nextProps.dampen,
            });
        }
    }

    render() {
        return (
            <div className="entry">
                <h1>Scrolling Physics:</h1>
                <input 
                    type="checkbox" 
                    name="lockX" 
                    checked={this.props.lockX}
                    onChange={e => this.props.actionSetCameraLocks(e.currentTarget.checked, this.props.lockY)} />
                <label htmlFor="lockX">Lock Horizontal</label>
                <span className="space"/>
                <input 
                    type="checkbox" 
                    name="lockY" 
                    checked={this.props.lockY}
                    onChange={e => this.props.actionSetCameraLocks(this.props.lockX, e.currentTarget.checked)} />
                <label htmlFor="lockY">Lock Vertical</label>
                <br />
                <input 
                    type="checkbox" 
                    name="constrainWorld" 
                    checked={this.props.constrainToWorld}
                    onChange={e => this.props.actionSetWorldConstraints(e.currentTarget.checked)} />
                <label htmlFor="constrainWorld">Constrain to World Edges</label>
                <br />
                &emsp;
                <label htmlFor="radius">Radius: </label>
                <input
                    className="textfield"
                    type="number"
                    name="radius"
                    value={this.state.radius}
                    onChange={e => this.setState({radius: +e.currentTarget.value})}/>
                <br/>
                &emsp;
                <VectorComponent 
                    xLabel="Spring" yLabel="Dampen"
                    value={createVector(this.state.spring, this.state.dampen)}
                    onChange={e => this.setState({spring: e.value.x, dampen: e.value.y})}
                />
                <br/>
                &emsp;
                <button
                    onClick={this.applyScrollArea}>
                    Apply
                </button>
                <br/>
                <input 
                    type="checkbox" 
                    name="showScroll" 
                    checked={this.props.showScroll}
                    onChange={e => this.props.actionShowCameraScroll(e.currentTarget.checked)} />
                <label htmlFor="showScroll">Show Scrolling Area</label>
            </div>
        );
    }
}

export const ScrollConfigCom = connect(mapStateToProps, mapDispatchToProps)(ScrollConfigComponent);
