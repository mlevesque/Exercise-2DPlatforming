import React from "react";
import { GameCanvas } from "./GameCanvasComponent";
import { Profile } from "./profile/ProfileComponent";
import { ConfigCom } from "./config/ConfigComponent";
import "../assets/styles/main.css";

export class MainComponent extends React.Component {
    render() {
        return (
            <div>
                <div className="container" >
                    <span className="one"><GameCanvas/></span>
                    <span className="two"><ConfigCom/></span>
                </div>
                <div className="container" >
                    <Profile/>
                </div>
            </div>
        )
    }
}

export default MainComponent;
