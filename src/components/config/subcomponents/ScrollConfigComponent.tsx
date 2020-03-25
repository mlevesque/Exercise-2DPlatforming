import { IMainState, IScrollArea } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionCameraSetScrollArea, actionShowCameraScroll, actionCameraSetLocks } from "../../../redux/actionCreators";
import React from "react";
import { connect, shallowEqual } from "react-redux";
import "../../../assets/styles/config.css";
import { VectorComponent } from "./VectorComponent";
import { createVector } from "../../../utils/geometry";

interface IProps {
    lockX: boolean;
    lockY: boolean;
    radius: number;
    spring: number;
    dampen: number;
    showScroll: boolean;
}

interface IDispatchActions {
    actionSetCameraLocks: (x: boolean, y: boolean) => void;
    actionSetScrollArea: (value: IScrollArea) => void;
    actionShowCameraScroll: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    radius: number;
    spring: number;
    dampen: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    const scrollArea = state.camera.scrollArea;
    return {
        lockX: state.camera.lockX,
        lockY: state.camera.lockY,
        radius: scrollArea.radius,
        spring: scrollArea.spring,
        dampen: scrollArea.dampen,
        showScroll: state.renderConfig.enableCameraScroll,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetCameraLocks: (x: boolean, y: boolean) => dispatch(actionCameraSetLocks(x, y)),
        actionSetScrollArea: (value: IScrollArea) => dispatch(actionCameraSetScrollArea(value)),
        actionShowCameraScroll: (value: boolean) => dispatch(actionShowCameraScroll(value)),
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

    applyScrollArea(event: React.FormEvent<HTMLButtonElement>) {
        const scrollArea: IScrollArea = {
            radius: this.state.radius,
            spring: this.state.spring,
            dampen: this.state.dampen,
        };
        this.props.actionSetScrollArea(scrollArea);
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
