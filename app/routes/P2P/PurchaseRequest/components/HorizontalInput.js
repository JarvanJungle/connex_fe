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
        errors, touched, upperCase, rows,
        onChange, maxLength
    } = props;

    const inputProps = {};
    if (onChange) {
        inputProps.onChange = onChange;
    }

    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={4} lg={4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8} lg={8}>
                {
                    type !== "textarea"
                        ? (
                            <Field
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
                                {...inputProps}
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
                                        disabled={disabled || false}
                                        {...inputProps}
                                        maxLength={maxLength || 500}
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
