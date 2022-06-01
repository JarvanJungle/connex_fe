import React, { forwardRef, useImperativeHandle } from "react";
import { Checkbox } from "primereact/checkbox";

const CheckboxRenderer = forwardRef((params, ref) => {
    useImperativeHandle(ref, () => ({
        getReactContainerStyle() {
            return {
                width: "100%",
                height: "100%",
                justifyContent: "center",
                display: "flex",
                alignItems: "center"
            };
        }
    }));

    const { data, node } = params;
    const { column } = params;
    const { colId } = column;

    const checkedHandler = (event) => {
        const { checked } = event.target;
        node.setDataValue(colId, checked);
    };

    return (
        <>
            {node.rowPinned !== "bottom" && (
                <Checkbox
                    onChange={checkedHandler}
                    checked={data[colId] ?? false}
                />
            )}
            {node.rowPinned === "bottom" && (<></>)}
        </>
    );
});

export default CheckboxRenderer;
