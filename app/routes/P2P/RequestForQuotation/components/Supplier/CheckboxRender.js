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

    const { data } = params;
    const checkedHandler = (event) => {
        const { checked } = event.target;
        const { column, node } = params;
        const { colId } = column;
        node.setDataValue(colId, checked);
    };

    return (
        <>
            {data?.itemCode?.length === 1 && (
                <Checkbox
                    onChange={checkedHandler}
                    checked={data?.available}
                />
            )}
            {data?.itemCode?.length === 2 && (<></>)}
        </>
    );
});

export default CheckboxRenderer;
