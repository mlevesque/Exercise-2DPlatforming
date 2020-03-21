import { IMainState } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { Dispatch } from "redux";
import { getLevelList } from "../../utils/jsonSchemas";
import { actionLoadLevel } from "../../redux/actionCreators";

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
    };
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionLoadLevel: (levelName: string) => dispatch(actionLoadLevel(levelName)),
    };
  }

class LevelConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            selectedLevelName: props.levelName,
        };

        this.onLevelDropdownSelected = this.onLevelDropdownSelected.bind(this);
    }

    onLevelDropdownSelected(e: React.FormEvent<HTMLSelectElement>) {
        this.setState({
            selectedLevelName: e.currentTarget.value,
        });
    }

    render() {
        // gather levels
        const levels = getLevelList();
        let optionItems = levels.levels.map((levelName: string) =>
            <option key={levelName}>{levelName}</option>
        );
        return (
            <div>
                {/* CURRENT LEVEL */}
                <div className="entry">
                    <b>Current Level:</b> {this.props.levelName}
                </div>
                <br />

                {/* SELECT LEVEL */}
                <div className="entry">
                    <h1>Select Level:</h1>
                    <select onChange={this.onLevelDropdownSelected}>
                        {optionItems}
                    </select>
                    <span style={{width:"10px"}} />
                    <button onClick={(e) => {this.props.actionLoadLevel(this.state.selectedLevelName)}} >Load</button>
                </div>
            </div>
        )
    }
}

export const LevelConfigCom = connect(mapStateToProps, mapDispatchToProps)(LevelConfigComponent);
