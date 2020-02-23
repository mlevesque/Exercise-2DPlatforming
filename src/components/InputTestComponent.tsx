import { IMainState } from "../model/IMainState";
import { InputType } from "../model/input.model";
import React, { ReactNode } from "react";
import { connect } from "react-redux";

interface IInputTestProps {
    leftPrevious: boolean;
    leftCurrent: boolean;
    rightPrevious: boolean;
    rightCurrent: boolean;
    jumpPrevious: boolean;
    jumpCurrent: boolean;
}

const mapStateToProps = (state: IMainState): IInputTestProps => {
    return {
        leftPrevious: state.input[InputType.Left].previous,
        leftCurrent: state.input[InputType.Left].current,
        rightPrevious: state.input[InputType.Right].previous,
        rightCurrent: state.input[InputType.Right].current,
        jumpPrevious: state.input[InputType.Jump].previous,
        jumpCurrent: state.input[InputType.Jump].current,
    };
}

class InputTestComponent extends React.PureComponent<IInputTestProps> {
    getStateOfPress(state: boolean): string {
        return state ? "true" : "false";
    }

    render() {
        return (
            <div>
                <div>LEFT: {this.getStateOfPress(this.props.leftPrevious)}, {this.getStateOfPress(this.props.leftCurrent)}</div>
                <div>RIGHT: {this.getStateOfPress(this.props.rightPrevious)}, {this.getStateOfPress(this.props.rightCurrent)}</div>
                <div>JUMP: {this.getStateOfPress(this.props.jumpPrevious)}, {this.getStateOfPress(this.props.jumpCurrent)}</div>
            </div>
        )
    }
}

export const InputTest = connect<IInputTestProps>(mapStateToProps)(InputTestComponent);
