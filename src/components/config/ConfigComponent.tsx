import { IMainState, ConfigTab } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { LevelConfigCom } from "./LevelConfigComponent";
import { PhysicsConfigCom } from "./PhysicsConfigComponent";
import { actionSetConfigTab } from "../../redux/actionCreators";
import { Dispatch } from "redux";

interface IProps {
    tab: ConfigTab;
}

interface IDispatchActions {
    actionSetTab: (tab: ConfigTab) => void;
}

type IFullProps = IProps & IDispatchActions;

const mapStateToProps = (state: IMainState): IProps => {
    return {
        tab: state.configTab
    };
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetTab: (tab: ConfigTab) => dispatch(actionSetConfigTab(tab)),
    };
}

class ConfigComponent extends React.PureComponent<IFullProps> {
    getTabContents(tab: ConfigTab): JSX.Element {
        switch (tab) {
            case ConfigTab.Level:
                return <LevelConfigCom/>;
            case ConfigTab.Physics:
                return <PhysicsConfigCom/>;
        }
    }

    render() {
        return (
            <div className="tabContainer">
                <div className="tab">
                    <button className="tablinks" onClick={(e) => this.props.actionSetTab(ConfigTab.Level)}>
                        Level
                    </button>
                    <button className="tablinks" onClick={(e) => this.props.actionSetTab(ConfigTab.Physics)}>
                        Physics
                    </button>
                </div>
                <div className="tabcontent">
                    {this.getTabContents(this.props.tab)}
                </div>
            </div>
        )
    }
}

export const ConfigCom = connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
