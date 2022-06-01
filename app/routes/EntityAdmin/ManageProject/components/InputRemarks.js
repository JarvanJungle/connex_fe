import React from "react";
import classNames from "classnames";
import {
    Field, ErrorMessage
} from "formik";

const InputRemarks = (props) => {
    const {
        disabled, name,
        component, placeholder,
        errors, touched, upperCase
    } = props;
    return (
        <>
            <Field
                name={name}
                component={component}
                disabled={disabled || false}
                placeholder={placeholder}
                className={classNames(
                    "form-control",
                    { "is-invalid": errors && touched },
                    { "text-uppercase": upperCase || false }
                )}
            />
        </>
    );
};

export default InputRemarks;
