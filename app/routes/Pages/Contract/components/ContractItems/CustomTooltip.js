import React, { forwardRef, useImperativeHandle, useState } from "react";

export default forwardRef((props, ref) => {
    const [data, setData] = useState(
        props.api.getDisplayedRowAtIndex(props.rowIndex).data
    );

    useImperativeHandle(ref, () => ({
        getReactContainerClasses() {
            return props.isShow ? ["custom-tooltip"] : [""];
        }
    }));

    return (
        <>
            {
                props.isShow
                && (
                    <div className="custom-tooltip-div">
                        <div className="custom-des">
                            <span>{data[props.fieldTooltip || "itemDescription"]}</span>
                        </div>
                    </div>
                )
            }
        </>
    );
});
