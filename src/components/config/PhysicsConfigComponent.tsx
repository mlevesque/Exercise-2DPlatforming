import { IMainState } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { IVector, createVector } from "../../utils/geometry";
import { actionSetGravity, actionSetAttachSegmentEnabled, actionShowPartition, actionShowCollisionSegment, actionShowEntityCollisions } from "../../redux/actionCreators";
import { Dispatch } from "redux";

interface IProps {
    gravity: IVector;
    enableSegAttach: boolean;
    showPartition: boolean;
    showCollisionSegments: boolean;
    showEntityCollisions: boolean;
}

interface IDispatchActions {
    actionSetGravity: (gravity: IVector) => void;
    actionSetEnableSegAttach: (value: boolean) => void;
    actionShowPartition: (value: boolean) => void;
    actionShowCollisionSegments: (value: boolean) => void;
    actionShowEntityCollisions: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    gravityX: number;
    gravityY: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        gravity: state.physics.gravity,
        enableSegAttach: state.physics.segmentAttachEnabled,
        showPartition: state.renderConfig.enablePartition,
        showCollisionSegments: state.renderConfig.enableCollisionSegments,
        showEntityCollisions: state.renderConfig.enableEntityCollisions,
    };
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
      actionSetGravity: (gravity: IVector) => dispatch(actionSetGravity(gravity)),
      actionSetEnableSegAttach: (value: boolean) => dispatch(actionSetAttachSegmentEnabled(value)),
      actionShowPartition: (value: boolean) => dispatch(actionShowPartition(value)),
      actionShowCollisionSegments: (value: boolean) => dispatch(actionShowCollisionSegment(value)),
      actionShowEntityCollisions: (value: boolean) => dispatch(actionShowEntityCollisions(value)),
    };
  }

class PhysicsConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            gravityX: props.gravity.x,
            gravityY: props.gravity.y
        };

        this.applyGravity = this.applyGravity.bind(this);
        this.onGravityXChange = this.onGravityXChange.bind(this);
        this.onGravityYChange = this.onGravityYChange.bind(this);
    }

    applyGravity() {
        this.props.actionSetGravity(createVector(this.state.gravityX, this.state.gravityY));
    }

    onGravityXChange(event: React.FormEvent<HTMLInputElement>) {
        this.setState({
            gravityX: +event.currentTarget.value,
            gravityY: this.state.gravityY,
        });
    }

    onGravityYChange(event: React.FormEvent<HTMLInputElement>) {
        this.setState({
            gravityX: this.state.gravityX,
            gravityY: +event.currentTarget.value,
        });
    }

    render() {
        return (
            <div>
                {/* GRAVITY */}
                <div className="entry">
                    <h1>Gravity:</h1>
                    x: <input 
                        className="textfield" 
                        type="number" 
                        id="gravityX" 
                        onChange={this.onGravityXChange}
                        defaultValue={this.props.gravity.x} />
                    <span>  </span>
                    y: <input 
                        className="textfield" 
                        type="number" 
                        id="gravityY" 
                        onChange={this.onGravityYChange}
                        defaultValue={this.props.gravity.y} />
                    <span>  </span>
                    <button onClick={this.applyGravity} >Apply</button>
                    <span>  </span>
                    <button onClick={() => {}} >Reset</button>
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

                {/* SHOW PARTITION */}
                <div className="entry">
                    <input 
                        type="checkbox" 
                        name="showPartition" 
                        checked={this.props.showPartition}
                        onChange={e => this.props.actionShowPartition(e.currentTarget.checked)} />
                    <label>Show Partition Cells</label>
                </div>
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
