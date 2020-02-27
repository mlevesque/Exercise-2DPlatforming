import React from "react"
import { connect } from "react-redux"
import { IMainState } from "../redux/state"

interface ICanvasProps {
    width: number;
    height: number;
}

const mapStateToProps = (state: IMainState): ICanvasProps => {
    return {
        width: state.camera.width,
        height: state.camera.height,
    }
}

class GameCanvasComponent extends React.PureComponent<ICanvasProps> {
    render() {
        return (
            <div>
                <canvas id="gameView" width={this.props.width} height={this.props.height} />
            </div>
        )
    }
}

export const GameCanvas = connect<ICanvasProps>(mapStateToProps)(GameCanvasComponent);
