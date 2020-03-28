import { IMainState } from "../redux/state";
import React from "react";
import { connect } from "react-redux";
import { ProfilePieComponent, IPieEntry } from "./profile/ProfilePieComponent";

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
    numberOfTimings: number = 5;

    highest: number = 0;
    timings: number[][];
    averages: number[];

    updateTiming(index: TimingIndex, newValue: number): void {
        this.averages[index] += newValue - this.timings[index][0];
        this.timings[index] = [...this.timings[index].slice(1), newValue];
    }

    getAverage(index: TimingIndex): number {
        return this.averages[index] / this.numberOfTimings;
    }

    getPercentage(index: TimingIndex): number {
        const averageFrameTime = this.getAverage(TimingIndex.FrameTime);
        return averageFrameTime == 0 ? 0 : this.getAverage(index) / averageFrameTime;
    }

    componentWillMount() {
        // setup timing arrays
        const numberOfEntries = Object.entries(this.props).length;
        this.timings = new Array<number[]>(numberOfEntries).fill([]);
        this.timings.forEach((val, i: number) => this.timings[i] = new Array<number>(this.numberOfTimings).fill(0));

        // setup averages
        this.averages = new Array<number>(numberOfEntries).fill(0);
    }

    render() {
        // update timings and averages
        this.updateTiming(TimingIndex.FrameTime, this.props.frameTime);
        this.updateTiming(TimingIndex.BehaviorActionTime, this.props.behaviorActionTime);
        this.updateTiming(TimingIndex.PhysicsTime, this.props.physicsTime);
        this.updateTiming(TimingIndex.BehaviorReactionTime, this.props.behaviorReactionTime);
        this.updateTiming(TimingIndex.AnimationTime, this.props.animationTime);
        this.updateTiming(TimingIndex.RenderTime, this.props.renderTime);

        const pieData: IPieEntry[] = [
            {percentage: this.getPercentage(TimingIndex.BehaviorActionTime), color: "blue"},
            {percentage: this.getPercentage(TimingIndex.PhysicsTime), color: "red"},
            {percentage: this.getPercentage(TimingIndex.BehaviorReactionTime), color: "purple"},
            {percentage: this.getPercentage(TimingIndex.AnimationTime), color: "yellow"},
            {percentage: this.getPercentage(TimingIndex.RenderTime), color: "green"},
        ];

        return (
            <div>
                <ProfilePieComponent width={50} height={50} pie={pieData} />
            </div>
        )
    }
}

export const Profile = connect<IProfileProps>(mapStateToProps)(ProfileComponent);
