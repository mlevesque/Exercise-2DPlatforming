import React from "react";
import { InputTest } from "./InputTestComponent";
import { GameCanvas } from "./GameCanvasComponent";
import { Profile } from "./ProfileComponent";

export class MainComponent extends React.Component {
    render() {
        return (
            <div>
                <div>Hello world!</div>
                <GameCanvas></GameCanvas>
                <Profile></Profile>
                <InputTest></InputTest>
            </div>
        )
    }
}

export default MainComponent;
