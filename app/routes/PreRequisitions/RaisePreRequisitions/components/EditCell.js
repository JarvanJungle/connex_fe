import React, { forwardRef, useImperativeHandle } from "react";

export default forwardRef((props, ref) => {
    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => ({
        getReactContainerClasses() {
            return ["custom-tooltip"];
        },
        getValue: () => props.value
    }));

    return (
        <div className="custom-tooltip-div">
            <div className="custom-des">
                <span>{props.value}</span>
            </div>
        </div>
    );
});
