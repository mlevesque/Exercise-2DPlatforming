import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionLoadLevel } from "../../../redux/actionCreators";
import React from "react";
import { connect } from "react-redux";
import { getLevelList } from "../../../utils/jsonSchemas";
import "../../../assets/styles/config.css";

interface IProps {
    levelName: string;
}

interface IDispatchActions {
    actionLoadLevel: (levelName: string) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    selectedLevelName: string;
}

const mapStateToProps = (state: IMainState): IProps => {
    return {
        levelName: state.levelName,
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionLoadLevel: (levelName: string) => dispatch(actionLoadLevel(levelName)),
    }
}

class LoadLevelConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            selectedLevelName: props.levelName,
        };
    }

    render() {
        const levels = getLevelList();
        let optionItems = levels.levels.map((levelName: string) =>
            <option key={levelName}>{levelName}</option>
        );
        return (
            <div className="entry">
                <h1>Load Level</h1>
                Current level: <b>{this.props.levelName}</b>
                <span className="space"/>
                <button onClick={(e) => this.props.actionLoadLevel(this.props.levelName)}>Reload</button>
                <br/>
                <label>Select Level:</label>
                <span className="space"/>
                <select 
                    style={{width: "120px"}} 
                    onChange={e => this.setState({selectedLevelName: e.currentTarget.value})}>
                    {optionItems}
                </select>
                <span className="space"/>
                <button onClick={e => this.props.actionLoadLevel(this.state.selectedLevelName)}>Load</button>
            </div>
        )
    }
}

export const LoadLevelConfigCom = connect(mapStateToProps, mapDispatchToProps)(LoadLevelConfigComponent);
