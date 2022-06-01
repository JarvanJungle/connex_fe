import React from "react";
import PropTypes from "prop-types";
import { Label, Row, Col } from "reactstrap";
import { Field } from "formik";
import classNames from "classnames";
import DateView from "react-datepicker";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const InputDateTime = (props) => {
    const {
        label, disabled, name,
        className,
        labelClassName,
        showTimeInput,
        dateFormat,
        placeholderText,
        loading
    } = props;

    const CustomTimeInput = ({ date, onChangeCustom }) => {
        const dateValue = date instanceof Date
            ? date.toLocaleTimeString("it-IT")
            : "";

        return (
            <input
                className="bp3-input bp3-fill"
                type="time"
                step="300"
                value={dateValue}
                onChange={(event) => onChangeCustom(date, event.target.value)}
            />
        );
    };

    const handleChangeTime = (date, time, field, setFieldValue) => {
        const [hh, mm, ss] = time.split(":");
        const targetDate = date instanceof Date ? date : new Date();
        targetDate.setHours(Number(hh) || 0, Number(mm) || 0, Number(ss) || 0);
        setFieldValue(field, targetDate);
    };

    return (
        <Row className={`${className} form-group`}>
            <Col md={4} className={labelClassName}>
                {!loading && (<Label className="p-0">{label}</Label>)}
                {loading && (<div className="phl-col-6" />)}
            </Col>
            <Col md={8}>
                {!loading && (
                    <Field name={name}>
                        {({ field, form }) => {
                            const {
                                setFieldValue, errors, touched
                            } = form;
                            const { value } = field;
                            return (
                                <>
                                    <DateView
                                        selected={value}
                                        onChange={(date) => setFieldValue(name, date)}
                                        showTimeInput={showTimeInput}
                                        className={classNames(
                                            "form-control",
                                            { "is-invalid": errors[field.name] && touched[field.name] }
                                        )}
                                        icon={<i className="icon-date" />}
                                        dateFormat={dateFormat}
                                        customTimeInput={(
                                            <CustomTimeInput
                                                onChangeCustom={
                                                    (date, time) => handleChangeTime(
                                                        date, time, field.name, setFieldValue
                                                    )
                                                }
                                            />
                                        )}
                                        clearIcon={null}
                                        disabled={disabled}
                                        placeholderText={placeholderText}
                                    />
                                    {errors[field.name] && touched[field.name] && (
                                        <div name={name} component="div" className="invalid-feedback d-block">{errors[field.name]}</div>
                                    )}
                                </>
                            );
                        }}
                    </Field>
                )}
                {loading && (<div className="phl-col-12" />)}
            </Col>
        </Row>
    );
};

InputDateTime.propTypes = {
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    labelClassName: PropTypes.string,
    showTimeInput: PropTypes.bool,
    dateFormat: PropTypes.string,
    placeholderText: PropTypes.string
};
InputDateTime.defaultProps = {
    disabled: false,
    className: "",
    labelClassName: "",
    showTimeInput: false,
    dateFormat: CUSTOM_CONSTANTS.DDMMYYYY,
    placeholderText: ""
};

export default InputDateTime;
