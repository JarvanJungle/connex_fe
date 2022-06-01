import React from "react";
import classNames from "classnames";
import {
    Label, Row, Col
} from "reactstrap";
import {
    Field, ErrorMessage
} from "formik";
import { v4 as uuidv4 } from "uuid";

const SelectInput = (props) => {
    const {
        label, disabled, name,
        className, placeholder,
        errors, touched, options,
        optionLabel, optionValue,
        onChange, value
    } = props;

    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={4} lg={4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8} lg={8}>
                <Field name={name}>
                    {({ field }) => (
                        <select
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...field}
                            className={
                                classNames(
                                    "form-control",
                                    { "is-invalid": errors && touched }
                                )
                            }
                            disabled={disabled || false}
                            onChange={onChange}
                            value={value}
                        >
                            <option value="" hidden defaultValue>{placeholder}</option>
                            {options && options
                                .map((option) => (
                                    <option
                                        key={uuidv4()}
                                        value={optionValue ? option[optionValue] : option}
                                    >
                                        {option[optionLabel]}
                                    </option>
                                ))}
                        </select>
                    )}
                </Field>
                <ErrorMessage name={name} component="div" className="invalid-feedback" />
            </Col>
        </Row>
    );
};

export default SelectInput;
