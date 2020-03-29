import React from "react";
import "../../assets/styles/profile.css";
import { IPieEntry } from "./shared";

interface IProps {
    entries: IPieEntry[];
}

export class ProfileLegendComponent extends React.Component<IProps> {
    render() {
        const listElements = this.props.entries.map(entry => {
            const label = entry.name + " (" + (entry.percentage * 100).toFixed(3) + "%)";
            return (
                <li>
                    <span className="box" style={{backgroundColor: entry.color}} />
                    <label>{label}</label>
                </li>
            )
        });

        return (
            <ul className="legend">
                {listElements}
            </ul>
        );
    }
}
