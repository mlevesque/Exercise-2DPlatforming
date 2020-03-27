import { IMainState, IEntityEntry } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionCameraSetEntityTarget } from "../../../redux/actionCreators";
import React from "react";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";
import { EntityCollection } from "../../../entities/EntityCollection";

interface IProps {
    entityTarget: string;
    allEntities: IEntityEntry[];
}

interface IDispatchActions {
    actionSetEntityTarget: (id: string) => void;
}

type IFullProps = IProps & IDispatchActions;

const mapStateToProps = (state: IMainState): IProps => {
    return {
        entityTarget: state.cameraConfig.entityTarget,
        allEntities: state.entities,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetEntityTarget: (id: string) => dispatch(actionCameraSetEntityTarget(id)),
    }
}

class ScrollTargetConfigComponent extends React.Component<IFullProps> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.onResetClicked = this.onResetClicked.bind(this);
    }

    onResetClicked() {
        const player = EntityCollection.getInstance().getPlayer();
        const id = player ? player.id : "";
        this.props.actionSetEntityTarget(id);
    }

    render() {
        let selectionIndex = 0;
        const selectonList = this.props.allEntities.map((entry, index) => {
            if (entry.id === this.props.entityTarget) {
                selectionIndex = index;
            }
            const value = entry.id;
            const text = "(" + entry.type + ") .." + entry.id.substring(entry.id.length - 6);
            return (
                <option value={value}>{text}</option>
            );
        });
        return (
            <div className="entry">
                <h1>Scroll Target</h1>
                &emsp;
                <label>Entity: </label>
                <select 
                    value={this.props.entityTarget}
                    onChange={e => this.props.actionSetEntityTarget(e.currentTarget.value)}>
                    {selectonList}
                </select>
                <span className="space"/>
                <button onClick={this.onResetClicked}>Reset</button>
            </div>
        );
    }
}

export const ScrollTargetConfigCom = connect(mapStateToProps, mapDispatchToProps)(ScrollTargetConfigComponent);
