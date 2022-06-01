import React from "react";
import { Checkbox } from "primereact/checkbox";

const ActiveCell = (props) => {
    const { data } = props;
    return (
        <div className="d-flex">
            <Checkbox inputId="defaultAddress" checked={data.active} />
        </div>
    );
};

export default ActiveCell;
