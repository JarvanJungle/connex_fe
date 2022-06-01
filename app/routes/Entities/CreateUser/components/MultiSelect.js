/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useState } from "react";
import _ from "lodash";
import pluralize from "pluralize";
import { v4 as uuidv4 } from "uuid";
import { MANAGE_ROLES_ROUTES } from "routes/EntityAdmin/ManageRoles";
import { Link } from "react-router-dom";

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
        disableSelected = false
    } = props;
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [displayValue, setDisplayValue] = useState("");
    const [hasInitialized, setHasInitialized] = useState(false);

    const onChange = (event) => {
        const value = JSON.parse(event.target.value);
        if (!_.isEmpty(value) && !_.some(selectedOptions, value)) {
            setSelectedOptions((prevState) => [...prevState, value]);
        }
    };

    useEffect(() => {
        if (defaultValue.length > 0 && !hasInitialized) {
            setSelectedOptions(defaultValue);
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
        setFieldValue(selectedOptions);
    }, [selectedOptions]);

    const removeSelectedItem = (index) => {
        const temp = selectedOptions;
        temp.splice(index, 1);
        setSelectedOptions([...temp]);
    };

    const clearAllItem = () => {
        setSelectedOptions([]);
    };
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
                    options.map((option) => (
                        <option
                            disabled={
                                disableSelected
                                    ? (!!selectedOptions.find((item) => item.name === option.name))
                                    : false
                            }
                            value={JSON.stringify(option)}
                            key={uuidv4()}
                        >
                            {option.name}
                        </option>
                    ))
                }
            </select>
            {
                !disabled
                && (
                    <div className="d-flex justify-content-end">
                        <Link
                            to={MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE}
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
                            Customize role
                        </Link>

                    </div>
                )
            }
            {
                (displaySelected && selectedOptions.length > 0)
                && (
                    <>
                        <ul className="list-group selected-items">
                            {
                                selectedOptions.map((selected, index) => (
                                    <li className="list-group-item py2 no-border" key={uuidv4()}>
                                        {selected.name}
                                        {
                                            !disabled
                                            && (
                                                <span
                                                    className="btn btn-xs pull-right"
                                                    onClick={() => { removeSelectedItem(index); }}
                                                    disabled={disabled}
                                                >
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
            }
        </>
    );
};

export default MultiSelect;
