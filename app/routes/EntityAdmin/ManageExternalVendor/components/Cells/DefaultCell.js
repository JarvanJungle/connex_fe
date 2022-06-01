import React from "react";
import { Checkbox } from "primereact/checkbox";

const DefaultCell = (props) => {
    const { data } = props;
    return (
        <div className="d-flex">
            <Checkbox checked={data.defaultAccount} />
        </div>
    );
};

export default DefaultCell;
