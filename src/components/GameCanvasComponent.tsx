import React from "react"
import { connect } from "react-redux"
import { IMainState } from "../redux/state"

interface ICanvasProps {
    halfWidth: number;
    halfHeight: number;
}

const mapStateToProps = (state: IMainState): ICanvasProps => {
    return {
        halfWidth: state.cameraConfig.halfWidth,
        halfHeight: state.cameraConfig.halfHeight,
    }
}

class GameCanvasComponent extends React.PureComponent<ICanvasProps> {
    render() {
        return (
            <div>
                <canvas id="gameView" width={this.props.halfWidth * 2} height={this.props.halfHeight * 2} />
            </div>
        )
    }
}

export const GameCanvas = connect<ICanvasProps>(mapStateToProps)(GameCanvasComponent);
