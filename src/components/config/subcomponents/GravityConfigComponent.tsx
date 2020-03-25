import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionSetGravity, actionResetGravity } from "../../../redux/actionCreators";
import React from "react";
import { VectorComponent } from "./VectorComponent";
import { IVector } from "../../../utils/geometry";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";

interface IProps {
    gravity: IVector;
}

interface IDispatchActions {
    actionSetGravity: (gravity: IVector) => void;
    actionResetGravity: () => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    gravity: IVector;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        gravity: state.physics.gravity,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetGravity: (gravity: IVector) => dispatch(actionSetGravity(gravity)),
        actionResetGravity: () => dispatch(actionResetGravity()),
    }
}

class GravityConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            gravity: props.gravity,
        };
    }

    render() {
        return (
            <div className="entry">
                <h1>Gravity:</h1>
                <VectorComponent onChange={e => this.setState({gravity: e.value})} value={this.state.gravity} />
                <span className="space"/>
                <button onClick={() => this.props.actionSetGravity(this.state.gravity)}>Apply</button>
                <span className="space"/>
                <button onClick={() => this.props.actionResetGravity()} >Reset</button>
            </div>
        );
    }
}

export const GravityConfigCom = connect(mapStateToProps, mapDispatchToProps)(GravityConfigComponent);
