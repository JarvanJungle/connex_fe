import React, { useEffect, useState } from "react";
import { Checkbox } from "primereact/checkbox";

const HeaderCheckbox = (params) => {
    const [checkedHeader, setCheckedHeader] = useState(false);
    const { api, column, editable } = params;

    const getRowDataItems = () => {
        if (!api) return [];
        const items = [];
        api.forEachNode((node) => {
            if (node?.data) items.push(node.data);
        });
        return items;
    };

    const onChange = (event) => {
        const { checked } = event.target;
        const { colId } = column;
        api.forEachNode((node) => {
            if (node) node.setDataValue(colId, checked);
        });
        api.refreshHeader();
    };

    useEffect(() => {
        const rowDataItem = getRowDataItems();
        let checked = true;
        const { colId } = column;
        rowDataItem.forEach((item) => {
            if (!item[colId]) checked = false;
        });
        setCheckedHeader(checked);
    }, []);

    return (
        <div
            className="d-flex justify-content-center align-items-center ml-4"
            style={{
                pointerEvents: !editable ? "none" : "unset",
                opacity: !editable ? "0.6" : "1"
            }}
        >
            <Checkbox
                name="checkHeader"
                checked={checkedHeader}
                onChange={onChange}
                disabled={!editable}
            />
        </div>
    );
};

export default HeaderCheckbox;
