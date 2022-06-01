/* eslint-disable react/jsx-props-no-spreading */
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
        onChange, value, colLabel, colValue,
        loading
    } = props;

    return (
        <Row className={`${className || ""} form-group`}>
            {label && (
                <>
                    <Col md={colLabel || 4}>
                        {!loading && (<Label className="p-0">{label}</Label>)}
                        {loading && (<div className="phl-col-6" />)}
                    </Col>
                    <Col md={colValue || 8}>
                        {!loading && (
                            <>
                                <Field name={name}>
                                    {({ field }) => (
                                        <select
                                            {...field}
                                            className={classNames(
                                                "form-control",
                                                { "is-invalid": errors && touched }
                                            )}
                                            disabled={disabled || false}
                                            onChange={onChange}
                                            value={value}
                                        >
                                            <option value="" hidden defaultValue>{placeholder}</option>
                                            {options
                                                .map((option) => (
                                                    <option
                                                        key={uuidv4()}
                                                        value={
                                                            optionValue
                                                                ? option[optionValue]
                                                                : option
                                                        }
                                                    >
                                                        {option[optionLabel]}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name={name} component="div" className="invalid-feedback" />

                            </>
                        )}
                        {loading && (<div className="phl-col-12" />)}
                    </Col>
                </>
            )}
            {!label && (
                <Col md={colValue || 12}>
                    {!loading && (
                        <>
                            <Field name={name}>
                                {({ field }) => (
                                    <select
                                        {...field}
                                        className={classNames(
                                            "form-control",
                                            { "is-invalid": errors && touched }
                                        )}
                                        disabled={disabled || false}
                                        onChange={onChange}
                                        value={value}
                                    >
                                        <option value="" hidden defaultValue>{placeholder}</option>
                                        {options
                                            .map((option) => (
                                                <option
                                                    key={uuidv4()}
                                                    value={
                                                        optionValue ? option[optionValue] : option
                                                    }
                                                >
                                                    {option[optionLabel]}
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </Field>
                            <ErrorMessage name={name} component="div" className="invalid-feedback" />

                        </>
                    )}
                    {loading && (<div className="phl-col-12" />)}
                </Col>
            )}
        </Row>
    );
};

export default SelectInput;
