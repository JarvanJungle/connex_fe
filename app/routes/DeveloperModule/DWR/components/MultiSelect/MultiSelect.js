import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import pluralize from "pluralize";

const MultiSelect = (props) => {
    const {
        options,
        name,
        className,
        objectName = "value",
        displaySelected = true,
        disabled = false,
        setFieldValue,
        defaultValue = [],
        invalid = false,
        disableSelected = false,
        withSerialNumber = false,
        updateSelected,
        selectedOptions = []
    } = props;
    // const [selectedOptions, setSelectedOptions] = useState([]);
    const [displayValue, setDisplayValue] = useState("");
    const [hasInitialized, setHasInitialized] = useState(false);

    const onChange = (event) => {
        const value = JSON.parse(event.target.value);
        if (!_.isEmpty(value) && !_.some(selectedOptions, value)) {
            // setSelectedOptions((prevState) => [...prevState, value]);
            updateSelected((prevState) => [...prevState, value]);
        }
    };

    useEffect(() => {
        if (defaultValue.length > 0 && !hasInitialized) {
            // setSelectedOptions(defaultValue);
            setHasInitialized(true);
        }
    }, [defaultValue]);

    useEffect(() => {
        const selectedOptionsLen = selectedOptions.length;
        if (selectedOptionsLen > 0) {
            setDisplayValue(`${selectedOptionsLen} ${pluralize(objectName, selectedOptionsLen)} Selected`);
        } else {
            setDisplayValue("");
        }
        setFieldValue(name, selectedOptions);
    }, [JSON.stringify(selectedOptions)]);

    return (
        <>
            <select
                name={name}
                type="select"
                className={`${className || "form-control"}${invalid ? " is-invalid" : ""}`}
                onChange={onChange}
                value={displayValue}
                disabled={disabled}
            >
                {
                    displayValue
                        ? <option value={displayValue} hidden>{displayValue}</option>
                        : <option value="">{`Please select a ${objectName}`}</option>
                }
                {
                    options.map((option, index) => (
                        <option
                            disabled={disableSelected ? (!!selectedOptions.find((item) => item.name === option.name)) : false}
                            value={JSON.stringify(option)}
                            key={index}
                        >
                            {option.name}
                        </option>
                    ))
                }
            </select>
            {/* {
                (displaySelected && selectedOptions.length > 0)
                && (
                    <>
                        <ul className="list-group selected-items">
                            {
                                selectedOptions.map((selected, index) => (
                                    <li className="list-group-item py2 no-border" key={index}>
                                        {withSerialNumber && `${index + 1}. `}
                                        {selected.name}
                                        {
                                            !disabled
                                            && (
                                                <span className="btn btn-xs pull-right" onClick={() => { removeSelectedItem(index); }} disabled={disabled}>
                                                    <span className="fa fa-close close-button" aria-hidden="true" />
                                                </span>
                                            )
                                        }
                                    </li>
                                ))
                            }
                        </ul>
                        {
                            !disabled
                            && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={clearAllItem}
                                    style={{
                                        color: "#4472C4",
                                        border: "unset",
                                        cursor: "pointer",
                                        background: "unset",
                                        textDecoration: "underline",
                                        padding: 0,
                                        textAlign: "left"
                                    }}
                                >
                                    Clear all
                                </button>
                            )
                        }
                    </>
                )
            } */}
        </>
    );
};

MultiSelect.propTypes = {
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    className: PropTypes.string,
    objectName: PropTypes.string,
    displaySelected: PropTypes.bool,
    disabled: PropTypes.bool,
    setFieldValue: PropTypes.func.isRequired,
    defaultValue: PropTypes.array,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool
};

export { MultiSelect };
