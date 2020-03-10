import { IMainState } from "../redux/state";
import React from "react";
import { connect } from "react-redux";
import { createVector, IVector } from "../utils/geometry";

interface IProfileProps {
    frameTime: number;
    behaviorActionTime: number;
    physicsTime: number;
    behaviorReactionTime: number;
    animationTime: number;
    renderTime: number;
}

const mapStateToProps = (state: IMainState): IProfileProps => {
    const profileData = state.profileData;
    return {
        frameTime: profileData.frameTime,
        behaviorActionTime: profileData.behaviorActionTime,
        physicsTime: profileData.physicsTime,
        behaviorReactionTime: profileData.behaviorReactionTime,
        animationTime: profileData.animationTime,
        renderTime: profileData.renderTime,
    }
}

class ProfileComponent extends React.PureComponent<IProfileProps> {
    center: IVector;
    radius: number;
    highest: number = 0;

    renderPiePiece = (ctx: CanvasRenderingContext2D, time: number, color: string, startPos: number): number => {
        const next = startPos + Math.PI * 2 * (time / this.props.frameTime);
        ctx.beginPath();
        ctx.moveTo(this.center.x, this.center.y);
        ctx.arc(this.center.x, this.center.y, this.radius, startPos, next);
        ctx.lineTo(this.center.x, this.center.y);
        ctx.fillStyle = color;
        ctx.fill();
        return next;
    }
    renderPieChart = (ctx: CanvasRenderingContext2D): void => {
        this.radius = 40;
        this.center = createVector(ctx.canvas.width / 2, ctx.canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let pos = this.renderPiePiece(ctx, this.props.behaviorActionTime, "blue", 0);
        pos = this.renderPiePiece(ctx, this.props.physicsTime, "red", pos);
        pos = this.renderPiePiece(ctx, this.props.behaviorReactionTime, "purple", pos);
        pos = this.renderPiePiece(ctx, this.props.animationTime, "orange", pos);
        pos = this.renderPiePiece(ctx, this.props.renderTime, "green", pos);
        this.highest = Math.max(this.highest, pos);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(this.center.x, this.center.y, this.radius, this.radius, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.center.x, this.center.y);
        ctx.arc(this.center.x, this.center.y, this.radius, 0, this.highest);
        ctx.lineTo(this.center.x, this.center.y);
        ctx.stroke();
    }

    componentDidUpdate() {
        const canvas = document.getElementById("profileView") as HTMLCanvasElement;
        this.renderPieChart(canvas.getContext("2d"));
    }
    render() {
        return (
            <div>
                <canvas id="profileView" width={100} height={100} />
            </div>
        )
    }
}

export const Profile = connect<IProfileProps>(mapStateToProps)(ProfileComponent);
