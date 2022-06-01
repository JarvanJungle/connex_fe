import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const refInput = useRef(null);

    useEffect(() => {
        // focus on the input
        setTimeout(() => refInput.current.focus());
    }, []);

    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => ({
        getValue: () => refInput.current.value
    }));
    if (props.data.path.length === 2) {
        return <input className="ag-input-field-input ag-text-field-input" type="text" ref={refInput} defaultValue={props.value} />;
    }
    return (
        <select className="form-control" ref={refInput} defaultValue={props.value} style={{ height: "41px" }}>
            <option key="key" value={props.value}>
                {props.value}
            </option>
            {props.values.map((text, i) => (
                <option key={i} value={text.tradeCode}>
                    {text.tradeCode}
                </option>
            ))}
        </select>
    );
});
