import React from "react";
import {
    Input, Row, Col, Label
} from "components";

const InputTextFiled = (props) => {
    const {
        disabled, name,
        type, value,
        className, label
    } = props;
    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={4} lg={4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8} lg={8}>
                <Input
                    name={name}
                    type={type}
                    value={value}
                    disabled={disabled || false}
                    className="form-control"
                />
            </Col>
        </Row>
    );
};

export default InputTextFiled;
