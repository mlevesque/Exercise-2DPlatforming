import React from "react";
import { InputTest } from "./InputTestComponent";

export class MainComponent extends React.Component {
    render() {
        return (
            <div>
                <div>Hello world!</div>
                <InputTest></InputTest>
            </div>
        )
    }
}

export default MainComponent;
