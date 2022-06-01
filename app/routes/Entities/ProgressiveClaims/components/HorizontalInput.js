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
        value,
        onChange,
        hyperlink
    } = props;

    const inputProps = {};
    if (onChange) {
        inputProps.onChange = onChange;
    }
    if (value) {
        inputProps.value = value;
    }

    const renderControl = () => (type !== "textarea"
        ? (
            <Field
                // value={value}
                name={name}
                type={type}
                disabled={disabled || false}
                placeholder={placeholder}
                className={
                    classNames(
                        "form-control",
                        { "is-invalid": errors && touched },
                        { "text-uppercase": upperCase || false },
                        { "cursor-pointer input-link": hyperlink }
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
                    />
                )}
            </Field>
        ));

    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={4} lg={4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8} lg={8}>
                {
                    hyperlink ? (<a href={hyperlink.url} target={hyperlink.blank ? "_blank" : ""} rel="noopener noreferrer">{ renderControl() }</a>) : renderControl()
                }
                <ErrorMessage name={name} component="div" className="invalid-feedback" />
            </Col>
        </Row>
    );
};

export default HorizontalInput;
