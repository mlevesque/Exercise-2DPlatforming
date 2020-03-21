import { IMainState, ConfigTab } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
import { LevelConfigCom } from "./LevelConfigComponent";
import { PhysicsConfigCom } from "./PhysicsConfigComponent";

interface IConfigProps {
    tab: ConfigTab;
}

const mapStateToProps = (state: IMainState): IConfigProps => {
    return {
        tab: state.configTab
    };
}

class ConfigComponent extends React.PureComponent<IConfigProps> {
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
                    <button className="tablinks" onClick={() => {}}>Level</button>
                    <button className="tablinks" onClick={() => {}}>Physics</button>
                </div>
                <div className="tabcontent">
                    {this.getTabContents(this.props.tab)}
                </div>
            </div>
        )
    }
}

export const ConfigCom = connect<IConfigProps>(mapStateToProps)(ConfigComponent);
