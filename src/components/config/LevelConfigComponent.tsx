import React from "react";
import "../../assets/styles/config.css";
import { getLevelList } from "../../utils/jsonSchemas";
import { LoadLevelConfigCom } from "./subcomponents/LoadLevelConfigComponent";
import { LevelTexturesConfigCom } from "./subcomponents/LevelTexturesConfigComponent";

export class LevelConfigComponent extends React.Component {
    render() {
        // gather levels
        const levels = getLevelList();
        let optionItems = levels.levels.map((levelName: string) =>
            <option key={levelName}>{levelName}</option>
        );
        return (
            <div>
                <LoadLevelConfigCom/>
                <hr/>
                <LevelTexturesConfigCom/>
            </div>
        )
    }
}
