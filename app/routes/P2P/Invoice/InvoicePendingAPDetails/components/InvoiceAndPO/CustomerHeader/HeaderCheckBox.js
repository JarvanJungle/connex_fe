import React, { forwardRef, useImperativeHandle } from "react";
import { Checkbox } from "primereact/checkbox";
const HeaderCheckBox = forwardRef((params, ref) => {
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
        node.setDataValue(colId, checked)
    };
    const invoiceStatus = params.context.invoiceStatus;
    const apSpecialist = params.context.apSpecialist;
    let isDisabled = false;
    if (invoiceStatus === "PENDING_APPROVAL" && apSpecialist) {
        isDisabled = true
    }
    return (
        <div
            className="d-flex align-items-center"
            style={{
                pointerEvents: params.context?.disabled ? "none" : "unset",
                opacity: params.context?.disabled ? "0.6" : "1"
            }}
        >
            <Checkbox
                disabled={isDisabled}
                checked={data[colId] ?? false}
                onChange={checkedHandler}
            />
        </div>
    );
});
export default HeaderCheckBox;