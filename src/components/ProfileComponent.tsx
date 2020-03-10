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

enum TimingIndex {
    FrameTime = 0,
    BehaviorActionTime = 1,
    PhysicsTime = 2,
    BehaviorReactionTime = 3,
    AnimationTime = 4,
    RenderTime = 5,
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
    radius: number = 40;
    numberOfTimings: number = 5;

    highest: number = 0;
    timings: number[][];
    averages: number[];

    renderPiePiece(ctx: CanvasRenderingContext2D, timePercentage: number, color: string, startPos: number): number {
        const next = startPos + Math.PI * 2 * timePercentage;
        ctx.beginPath();
        ctx.moveTo(this.center.x, this.center.y);
        ctx.arc(this.center.x, this.center.y, this.radius, startPos, next);
        ctx.lineTo(this.center.x, this.center.y);
        ctx.fillStyle = color;
        ctx.fill();
        return next;
    }
    renderPieChart(ctx: CanvasRenderingContext2D): void {
        this.center = createVector(ctx.canvas.width / 2, ctx.canvas.height / 2);

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let pos = this.renderPiePiece(ctx, this.getPercentage(TimingIndex.BehaviorActionTime), "blue", 0);
        pos = this.renderPiePiece(ctx, this.getPercentage(TimingIndex.PhysicsTime), "red", pos);
        pos = this.renderPiePiece(ctx, this.getPercentage(TimingIndex.BehaviorReactionTime), "purple", pos);
        pos = this.renderPiePiece(ctx, this.getPercentage(TimingIndex.AnimationTime), "orange", pos);
        pos = this.renderPiePiece(ctx, this.getPercentage(TimingIndex.RenderTime), "green", pos);
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

    updateTiming(index: TimingIndex, newValue: number): void {
        this.averages[index] += newValue - this.timings[index][0];
        this.timings[index] = [...this.timings[index].slice(1), newValue];
    }

    getAverage(index: TimingIndex): number {
        return this.averages[index] / this.numberOfTimings;
    }

    getPercentage(index: TimingIndex): number {
        return this.getAverage(index) / this.getAverage(TimingIndex.FrameTime);
    }

    componentDidUpdate() {
        // update timings and averages
        this.updateTiming(TimingIndex.FrameTime, this.props.frameTime);
        this.updateTiming(TimingIndex.BehaviorActionTime, this.props.behaviorActionTime);
        this.updateTiming(TimingIndex.PhysicsTime, this.props.physicsTime);
        this.updateTiming(TimingIndex.BehaviorReactionTime, this.props.behaviorReactionTime);
        this.updateTiming(TimingIndex.AnimationTime, this.props.animationTime);
        this.updateTiming(TimingIndex.RenderTime, this.props.renderTime);

        const canvas = document.getElementById("profileView") as HTMLCanvasElement;
        this.renderPieChart(canvas.getContext("2d"));
    }

    componentDidMount() {
        // setup timing arrays
        const numberOfEntries = Object.entries(this.props).length;
        this.timings = new Array<number[]>(numberOfEntries).fill([]);
        this.timings.forEach((val, i: number) => this.timings[i] = new Array<number>(this.numberOfTimings).fill(0));

        // setup averages
        this.averages = new Array<number>(numberOfEntries).fill(0);
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
