import React, { createRef } from "react";
import { createVector } from "../../utils/geometry";

export interface IPieEntry {
    percentage: number;
    color: string;
}

interface IProps {
    width: number;
    height: number;
    pie: IPieEntry[];
}

export class ProfilePieComponent extends React.Component<IProps> {
    private _canvas = createRef<HTMLCanvasElement>();

    componentDidUpdate() {
        const ctx = this._canvas.current.getContext("2d");
        const center = createVector(ctx.canvas.width / 2, ctx.canvas.height / 2);
        const radius = Math.min(ctx.canvas.width, ctx.canvas.height) / 2 - 2;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let startPos = 0;
        this.props.pie.forEach(entry => {
            const next = startPos + Math.PI * 2 * entry.percentage;
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.arc(center.x, center.y, radius, startPos, next);
            ctx.lineTo(center.x, center.y);
            ctx.fillStyle = entry.color;
            ctx.fill();
            startPos = next;
        });

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    render() {
        return (
            <div>
                <canvas width={this.props.width} height={this.props.height} ref={this._canvas} />
            </div>
        );
    }
}
