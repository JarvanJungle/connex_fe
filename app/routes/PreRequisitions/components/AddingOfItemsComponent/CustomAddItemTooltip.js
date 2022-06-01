import React, { forwardRef, useImperativeHandle, useState } from "react";

export default forwardRef((props, ref) => {
    const { data } = props.api.getDisplayedRowAtIndex(props.rowIndex);
    const [content, setContent] = useState(data.itemDescription);

    useImperativeHandle(ref, () => {
        if (props.colDef.tooltipField === "note") {
            setContent(data.note);
        } else {
            setContent(data.itemDescription);
        }
        return {
            getReactContainerClasses() {
                return ["custom-tooltip"];
            }
        };
    });

    return (
        <div className="custom-tooltip-div">
            <div className="custom-des">
                <span>{content}</span>
            </div>
        </div>
    );
});
