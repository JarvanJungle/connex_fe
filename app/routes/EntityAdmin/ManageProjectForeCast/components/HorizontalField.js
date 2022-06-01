import React from "react";
import {
    Label, Input
} from "reactstrap";
import classes from "./ProjectForecast.module.scss";

const HorizontalField = (props) => {
    const {
        label, id, content, className
    } = props;
    return (
        <div className={`mb-4 justify-content-around d-flex flex-row ${className}`}>
            <Label xs={4} for={id} className={`${classes.label} p-0`}>{label}</Label>
            <Input xs={8} type="text" id={id} defaultValue={content} disabled className="ml-2" />
        </div>
    );
};

export default HorizontalField;
