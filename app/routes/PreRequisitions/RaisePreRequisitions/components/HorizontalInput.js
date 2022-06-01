import React from "react";
import classNames from "classnames";
import {
    Label, Row, Col
} from "reactstrap";
import {
    Field, ErrorMessage
} from "formik";

const HorizontalInput = (props) => {
    const {
        label, disabled, name,
        type, className, placeholder,
        errors, touched, upperCase, rows, value, colLabel, colValue
    } = props;
    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={colLabel || 4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={colValue || 8}>
                {
                    type !== "textarea"
                        ? (
                            <Field
                                value={value}
                                name={name}
                                type={type}
                                disabled={disabled || false}
                                placeholder={placeholder}
                                className={
                                    classNames(
                                        "form-control",
                                        { "is-invalid": errors && touched },
                                        { "text-uppercase": upperCase || false }
                                    )
                                }
                            />
                        ) : (
                            <Field name={name}>
                                {({ field }) => (
                                    <textarea
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...field}
                                        className={
                                            classNames(
                                                "form-control",
                                                { "is-invalid": errors && touched }
                                            )
                                        }
                                        rows={rows || 5}
                                        placeholder={placeholder}
                                        value={value}
                                        disabled={disabled || false}
                                    />
                                )}
                            </Field>
                        )
                }
                <ErrorMessage name={name} component="div" className="invalid-feedback" />
            </Col>
        </Row>
    );
};

export default HorizontalInput;
