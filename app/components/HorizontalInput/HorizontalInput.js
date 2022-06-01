/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from "react";
import classNames from "classnames";
import {
    Label, Row, Col
} from "reactstrap";
import {
    Field, ErrorMessage
} from "formik";
import moment from "moment";

const HorizontalInput = (props) => {
    const {
        label, disabled, name,
        type, className, placeholder, maxLength,
        errors, touched, upperCase, rows, value, colLabel, colValue, dateFormat, id,
        loading, minDate = "", maxDate = ""
    } = props;
    const formatDateString = (dateString, format) => (
        dateString ? moment(new Date(dateString))
            .format(format) : null
    );
    useEffect(() => {
        if (type === "date" && id && dateFormat) {
            document.getElementById(id)
                .setAttribute("data-date", value ? formatDateString(value, dateFormat) : dateFormat.toLowerCase());
        }
    }, [value]);
    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={colLabel || 4}>
                {!loading && (
                    <Label className="p-0">{label}</Label>
                )}
                {loading && (<div className="phl-col-6" />)}
            </Col>
            <Col md={colValue || 8}>
                {type !== "textarea" && !loading && (
                    <Field
                        id={id}
                        value={value}
                        name={name}
                        type={type}
                        disabled={disabled || false}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        className={
                            classNames(
                                "form-control",
                                { "is-invalid": errors && touched },
                                { "text-uppercase": upperCase || false }
                            )
                        }
                        min={minDate}
                        max={maxDate}
                    />
                )}
                {type === "textarea" && !loading && (
                    <Field name={name}>
                        {({ field }) => (
                            <textarea
                                {...field}
                                className={
                                    classNames(
                                        "form-control",
                                        { "is-invalid": errors && touched }
                                    )
                                }
                                rows={rows || 5}
                                maxLength={maxLength}
                                placeholder={placeholder}
                                disabled={disabled || false}
                            />
                        )}
                    </Field>
                )}
                {!loading && (<ErrorMessage name={name} component="div" className="invalid-feedback" />)}
                {loading && (<div className="phl-col-12" />)}
            </Col>
        </Row>
    );
};

export default HorizontalInput;
