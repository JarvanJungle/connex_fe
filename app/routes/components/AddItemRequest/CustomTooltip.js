import React, { forwardRef, useImperativeHandle, useState } from "react";

export default forwardRef((props, ref) => {
    const [data] = useState(
        props.api.getDisplayedRowAtIndex(props.rowIndex).data
    );
    const [value] = useState(
        props.valueFormatted || props.value
    );

    useImperativeHandle(ref, () => ({
        getReactContainerClasses() {
            return props.isShow ? ["custom-tooltip"] : [""];
        }
    }));

    return (
        <>
            {props.isShow && (
                <div className="custom-tooltip-div">
                    <div className="custom-des" style={{ whiteSpace: "pre-wrap" }}>
                        <span>{!props.showValue ? data[props.fieldTooltip || "itemDescription"] : value}</span>
                    </div>
                </div>
            )}
        </>
    );
});
