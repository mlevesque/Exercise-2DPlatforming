import { IMainState, ConfigTab } from "../../redux/state";
import React from "react";
import { connect } from "react-redux";
import "../../assets/styles/config.css";
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
    render() {
        let contents;
        switch (this.props.tab) {
            case ConfigTab.Physics:
                contents = <PhysicsConfigCom/>;
        }

        return (
            <div className="tabContainer">
                <div className="tab">
                    <button className="tablinks" onClick={() => {}}>Physics</button>
                </div>
                <div className="tabcontent">
                    {contents}
                </div>
            </div>
        )
    }
}

export const ConfigCom = connect<IConfigProps>(mapStateToProps)(ConfigComponent);
