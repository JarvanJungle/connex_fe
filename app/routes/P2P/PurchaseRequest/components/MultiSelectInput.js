import React from "react";
import {
    Label, Row, Col
} from "reactstrap";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import { makeStyles } from "@material-ui/core/styles";
import { Field, ErrorMessage } from "formik";
import classNames from "classnames";
import { v4 as uuidv4 } from "uuid";

const useStyles = makeStyles({
    form: {
        maxWidth: 300,
        minWidth: "100%"
    }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250
        }
    }
};

const MultiSelectInput = (props) => {
    const classes = useStyles();
    const {
        label, disabled, name,
        className, placeholder,
        errors, touched, options,
        optionLabel, optionValue, optionLabelSelected
    } = props;

    return (
        <Row className={`${className || ""} form-group`}>
            <Col md={4} lg={4}>
                <Label className="p-0">{label}</Label>
            </Col>
            <Col md={8} lg={8}>
                <Field name={name}>
                    {({ field }) => (
                        <Select
                            {...field}
                            className={
                                classNames(
                                    `${classes.form} form-control`,
                                    { "is-invalid": errors && touched }
                                )
                            }
                            multiple
                            displayEmpty
                            input={<Input />}
                            MenuProps={MenuProps}
                            renderValue={(selected) => {
                                if (!selected || selected.length === 0) {
                                    return <div>{placeholder}</div>;
                                }

                                if (selected.length > 1) {
                                    return `${selected.length} vendors selected`;
                                }
                                const list = selected.map(
                                    (item) => item[optionLabelSelected || optionLabel]
                                );
                                return list.join(", ");
                            }}
                            disabled={disabled || false}
                        >
                            {options.map((option) => (
                                <MenuItem
                                    key={uuidv4()}
                                    value={optionValue ? option[optionValue] : option}
                                >
                                    {option[optionLabel]}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </Field>
                <ErrorMessage name={name} component="div" className="invalid-feedback" />
            </Col>
        </Row>
    );
};

export default MultiSelectInput;
