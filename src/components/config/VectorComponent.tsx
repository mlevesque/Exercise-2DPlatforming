import { IVector, createVector, areVectorsEqual } from "../../utils/geometry";
import React from "react";

interface IProps {
    xLabel?: string;
    yLabel?: string;
    value?: IVector;
    onChange?: (e: VectorComponentEvent) => void;
}

interface IState {
    x: number;
    y: number;
}

/**
 * Event for when the values change in any of the textboxes for the vector component.
 */
export class VectorComponentEvent extends Event {
    private _value: IVector;
    constructor(type: string, value: IVector) {
        super(type);
        this._value = value;
    }
    get value(): IVector {return this._value;}
}

/**
 * Represents a UI element for a 2D Vector.
 */
export class VectorComponent extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            x: props.value ? props.value.x : 0,
            y: props.value ? props.value.y : 0
        };
        this.onXChange = this.onXChange.bind(this);
        this.onYChange = this.onYChange.bind(this);
    }

    dispatchChangeEvent(x: number, y: number) {
        if (this.props.onChange) {
            const event = new VectorComponentEvent("onchange", createVector(x, y));
            this.props.onChange(event);
        }
    }

    onXChange(e: React.FormEvent<HTMLInputElement>) {
        this.dispatchChangeEvent(+e.currentTarget.value, this.state.y);
        this.setState({
            x: +e.currentTarget.value,
            y: this.state.y
        });
    }

    onYChange(e: React.FormEvent<HTMLInputElement>) {
        this.dispatchChangeEvent(this.state.x, +e.currentTarget.value);
        this.setState({
            x: this.state.x,
            y: +e.currentTarget.value
        });
    }

    componentWillUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>) {
        if (!areVectorsEqual(nextProps.value, this.props.value)) {
            this.setState({
                x: nextProps.value ? nextProps.value.x : 0,
                y: nextProps.value ? nextProps.value.y : 0
            });
        }
    }

    render() {
        return (
            <span>
                {this.props.xLabel ? this.props.xLabel : "x"}: <input 
                    className="textfield" 
                    type="number" 
                    onChange={this.onXChange}
                    value={this.state ? this.state.x : 0} />
                <span style={{width:"10px"}} />
                {this.props.yLabel ? this.props.yLabel : "y"}: <input 
                    className="textfield" 
                    type="number" 
                    onChange={this.onYChange}
                    value={this.state ? this.state.y : 0} />
            </span>
        )
    }
}
