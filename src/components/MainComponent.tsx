import React from "react";
import { InputTest } from "./InputTestComponent";
import { GameCanvas } from "./GameCanvasComponent";

export class MainComponent extends React.Component {
    render() {
        return (
            <div>
                <div>Hello world!</div>
                <GameCanvas></GameCanvas>
                <InputTest></InputTest>
            </div>
        )
    }
}

export default MainComponent;
