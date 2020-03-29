import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionShowEntityCollisions, actionSetAttachSegmentEnabled, actionHighlightAttachSegment } from "../../../redux/actionCreators";
import React from "react";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";

interface IProps {
    enableSegAttach: boolean;
    highlightAttachSegment: boolean;
    showEntityCollisions: boolean;
}

interface IDispatchActions {
    actionSetEnableSegAttach: (value: boolean) => void;
    actionHighlightAttachSegment: (value: boolean) => void;
    actionShowEntityCollisions: (value: boolean) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        enableSegAttach: state.physics.segmentAttachEnabled,
        highlightAttachSegment: state.renderConfig.enableAttachCollision,
        showEntityCollisions: state.renderConfig.enableEntityCollisions,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetEnableSegAttach: (value: boolean) => dispatch(actionSetAttachSegmentEnabled(value)),
        actionHighlightAttachSegment: (value: boolean) => dispatch(actionHighlightAttachSegment(value)),
        actionShowEntityCollisions: (value: boolean) => dispatch(actionShowEntityCollisions(value)),
    }
}

class EntityCollisionsConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className="entry">
                <h1>Entity Collisions</h1>
                <input 
                    type="checkbox" 
                    name="enableSegmentAttachment" 
                    checked={this.props.enableSegAttach}
                    onChange={e => this.props.actionSetEnableSegAttach(e.currentTarget.checked)} />
                <label htmlFor="enableSegmentAttachment">Enable Entities Attach to Segments</label>
                <br/>
                &emsp;
                <input 
                    type="checkbox" 
                    name="highlightAttachSegment" 
                    checked={this.props.highlightAttachSegment}
                    onChange={e => this.props.actionHighlightAttachSegment(e.currentTarget.checked)} />
                <label htmlFor="highlightAttachSegment">Highlight Player Attached Segment</label>
                <br/>
                <input 
                    type="checkbox" 
                    name="showEntityCollisions" 
                    checked={this.props.showEntityCollisions}
                    onChange={e => this.props.actionShowEntityCollisions(e.currentTarget.checked)} />
                <label htmlFor="showEntityCollisions">Show Entity Collisions</label>
            </div>
        );
    }
}

export const EntityCollisionsConfigCom = connect(mapStateToProps, mapDispatchToProps)(EntityCollisionsConfigComponent);
