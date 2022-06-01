import React from "react";
import PropTypes from "prop-types";
import { InputNumber } from "primereact/inputnumber";
import { Label, Row, Col } from "reactstrap";
import { Field } from "formik";
import classNames from "classnames";

const InputFormatNumber = (props) => {
    const {
        label, disabled, name,
        className,
        value,
        handleChange,
        maxFractionDigits,
        minFractionDigits,
        labelClassName
    } = props;

    return (
        <Row className={`${className} form-group`}>
            <Col md={4} className={labelClassName}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8}>
                <Field
                    name={name}
                    value={value}
                    onChange={handleChange}
                    component={({ field, form: { touched, errors } }) => (
                        <>
                            <InputNumber
                                name={name}
                                inputClassName={
                                    classNames({ "is-invalid": errors[field.name] && touched[field.name] })
                                }
                                value={value}
                                onValueChange={handleChange}
                                mode="decimal"
                                locale="en-US"
                                maxFractionDigits={maxFractionDigits}
                                minFractionDigits={minFractionDigits}
                                disabled={disabled}
                            />
                            {errors[field.name] && touched[field.name] && (
                                <div name={name} component="div" className="invalid-feedback d-block">{errors[field.name]}</div>
                            )}
                        </>
                    )}
                />
            </Col>
        </Row>
    );
};

InputFormatNumber.propTypes = {
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    value: PropTypes.number,
    maxFractionDigits: PropTypes.number,
    minFractionDigits: PropTypes.number,
    labelClassName: PropTypes.string
};
InputFormatNumber.defaultProps = {
    disabled: true,
    className: "",
    value: 0,
    maxFractionDigits: 2,
    minFractionDigits: 2,
    labelClassName: ""
};

export default InputFormatNumber;
