import { IMainState } from "../../../redux/state";
import { Dispatch } from "redux";
import { actionSetGravity, actionResetGravity, actionSetMapTextures } from "../../../redux/actionCreators";
import React from "react";
import { VectorComponent } from "./VectorComponent";
import { IVector } from "../../../utils/geometry";
import { connect } from "react-redux";
import "../../../assets/styles/config.css";
import { getMapTextures } from "../../../utils/jsonSchemas";

interface IProps {
    hasMap: boolean;
    currentTileset: string;
    currentBackground: string;
}

interface IDispatchActions {
    actionSetMapTextures: (tileset: string, background: string) => void;
}

type IFullProps = IProps & IDispatchActions;

interface IState {
    selectedTileset: string;
    selectedBackground: string;
}

const mapStateToProps = (state: IMainState): IProps => {
    const hasMap = state.map != null;
    return {
        hasMap: hasMap,
        currentTileset: hasMap ? state.map.tileset : "",
        currentBackground: hasMap ? state.map.background : "",
    }
}

const mapDispatchToProps = (dispatch: Dispatch): IDispatchActions => {
    return {
        actionSetMapTextures: (tileset: string, background: string) => 
            dispatch(actionSetMapTextures(tileset, background)),
    }
}

class LevelTexturesConfigComponent extends React.Component<IFullProps, IState> {
    constructor(props: Readonly<IFullProps>) {
        super(props);
        this.state = {
            selectedTileset: props.currentTileset,
            selectedBackground: props.currentBackground,
        };
        this.onButtonPress = this.onButtonPress.bind(this);
    }

    onButtonPress() {
        this.props.actionSetMapTextures(this.state.selectedTileset, this.state.selectedBackground);
    }

    componentWillUpdate(nextProps: IProps) {
        if (this.props.hasMap !== nextProps.hasMap
            || this.props.currentTileset !== nextProps.currentTileset 
            || this.props.currentBackground != nextProps.currentBackground) {
            this.setState({
                selectedTileset: nextProps.currentTileset,
                selectedBackground: nextProps.currentBackground,
            })
        }
    }

    render() {
        const data = getMapTextures();
        const tilsetList = data.tilesets.map(value => {
            return (<option value={value.file}>{value.name}</option>);
        });
        const backgroundList = data.backgrounds.map(value => {
            return (<option value={value.file}>{value.name}</option>);
        });

        return (
            <div className="entry">
                <h1>Level Textures</h1>
                <label htmlFor="tileset">Tileset: </label>
                <select 
                    name="tileset"
                    value={this.state.selectedTileset}
                    disabled={!this.props.hasMap}
                    onChange={e => this.setState({selectedTileset: e.currentTarget.value})}>
                    {tilsetList}
                </select>
                <br/>
                <label htmlFor="background">Background: </label>
                <select 
                    name="background"
                    value={this.state.selectedBackground}
                    disabled={!this.props.hasMap}
                    onChange={e => this.setState({selectedBackground: e.currentTarget.value})}>
                    {backgroundList}
                </select>
                <br/>
                <button onClick={this.onButtonPress}>Apply</button>
            </div>
        );
    }
}

export const LevelTexturesConfigCom = connect(mapStateToProps, mapDispatchToProps)(LevelTexturesConfigComponent);
