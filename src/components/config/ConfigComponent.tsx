import { IMainState, ConfigTab } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { LevelConfigComponent } from "./LevelConfigComponent";
import { PhysicsConfigComponent } from "./PhysicsConfigComponent";
import { actionSetConfigTab } from "../../redux/actionCreators";
import { Dispatch } from "redux";

interface IProps {
    tab: ConfigTab;
}

interface IDispatchActions {
    actionSetTab: (tab: ConfigTab) => void;
}

interface ITabEntry {
    name: string;
    type: ConfigTab;
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
                return <LevelConfigComponent/>;
            case ConfigTab.Physics:
                return <PhysicsConfigComponent/>;
        }
    }

    buildConfigTabButtons(): JSX.Element[] {
        const tabs = [
            {name: "Level", type: ConfigTab.Level},
            {name: "Physics", type: ConfigTab.Physics},
        ];
        return tabs.map((entry: ITabEntry) => {
            return (
            <button className="tabLinks" onClick={e => this.props.actionSetTab(entry.type)}>
                {entry.name}
            </button>)
        });
    }

    render() {
        return (
            <div className="tabContainer">
                <div className="tab">
                    {this.buildConfigTabButtons()}
                </div>
                <div className="tabcontent">
                    {this.getTabContents(this.props.tab)}
                </div>
            </div>
        )
    }
}

export const ConfigCom = connect(mapStateToProps, mapDispatchToProps)(ConfigComponent);
