import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionShowCollisionSegment, actionSetPartitionSegmentId } 
    from "../../../redux/actionCreators";
import React from "react";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";

interface IProps {
    showCollisionSegments: boolean;
    collisionSegmentIds: string[];
}

interface IDispatchActions {
    actionShowCollisionSegments: (value: boolean) => void;
    actionSetHighlightedSegment: (value: string) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    enableSegmentHighlight: boolean;
    segmentIndex: number;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        showCollisionSegments: state.renderConfig.enableCollisionSegments,
        collisionSegmentIds: Object.entries(state.staticCollisions).map((v) => v[0]),
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionShowCollisionSegments: (value: boolean) => dispatch(actionShowCollisionSegment(value)),
        actionSetHighlightedSegment: (value: string) => dispatch(actionSetPartitionSegmentId(value)),
    }
}

class CollisionSegmentsConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            enableSegmentHighlight: false,
            segmentIndex: 0,
        };

        this.onEnableHighlightSegmentChanged = this.onEnableHighlightSegmentChanged.bind(this);
        this.onHighlightSegmentChanged = this.onHighlightSegmentChanged.bind(this);
    }

    onEnableHighlightSegmentChanged(event: React.FormEvent<HTMLInputElement>) {
        const checked = event.currentTarget.checked;
        const id = checked ? this.props.collisionSegmentIds[this.state.segmentIndex] : "";
        this.props.actionSetHighlightedSegment(id);
        this.setState({
            enableSegmentHighlight: checked,
        });
    }

    onHighlightSegmentChanged(event: React.FormEvent<HTMLSelectElement>) {
        if (this.state.enableSegmentHighlight) {
            const index = event.currentTarget.selectedIndex;
            this.props.actionSetHighlightedSegment(this.props.collisionSegmentIds[index]);
            this.setState({
                segmentIndex: index
            });
        }
    }

    render() {
        const segmentList = this.props.collisionSegmentIds.map(v => {
            const label = ".." + v.substring(v.length - 6);
            return (<option>{label}</option>)
        });
        return (
            <div className="entry">
                <h1>Collision Segments</h1>
                <input 
                    type="checkbox" 
                    name="showCollisionSegments" 
                    checked={this.props.showCollisionSegments}
                    onChange={e => this.props.actionShowCollisionSegments(e.currentTarget.checked)} />
                <label htmlFor="showCollisionSegments">Show Collision Segments</label>
                <br/>
                &emsp;
                <input
                    type="checkbox"
                    name="highlightSegment"
                    checked={this.state.enableSegmentHighlight}
                    onChange={this.onEnableHighlightSegmentChanged}
                    disabled={!this.props.showCollisionSegments} />
                <label htmlFor="highlightSegment">Highlight Segment: </label>
                <select disabled={!this.state.enableSegmentHighlight} onChange={this.onHighlightSegmentChanged} >
                    {segmentList}
                </select>
            </div>
        );
    }
}

export const CollisionSegmentsConfigCom = connect(mapStateToProps, mapDispatchToProps)(CollisionSegmentsConfigComponent);
