import React, { Component } from "react";

export default class extends Component {
    constructor(props) {
        super(props);
        this.checkedHandler = this.checkedHandler.bind(this);
    }

    checkedHandler() {
        const { checked } = event.target;
        const { colId } = this.props.column;
        this.props.node.setDataValue(colId, checked);
    }

    render() {
        return (
            <input
                type="checkbox"
                checked={this.props.value}
                readOnly
            />
        );
    }
}