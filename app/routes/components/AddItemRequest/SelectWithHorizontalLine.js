import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef((props, ref) => {
    const refInput = useRef(null);
    const supplierHasUnitPrice = props.values.filter((item) => item.unitPrice);
    const supplierNotUnitPrice = props.values.filter((item) => !item.unitPrice);

    useEffect(() => {
        // focus on the input
        setTimeout(() => refInput.current.focus());
    }, []);
    /* Component Editor Lifecycle methods */
    useImperativeHandle(ref, () => ({
        getValue: () => refInput.current.value
    }));
    return (
        <select className="form-control" ref={refInput} defaultValue={typeof (props.value) === "object" ? JSON.stringify(props.value) : props.value} style={{ height: "41px" }}>
            {
                !props.value
                && (
                    <option key="key" value={typeof (props.value) === "object" ? JSON.stringify(props.value) : props.value} />
                )
            }
            {supplierHasUnitPrice.map((text, i) => (
                <option key={i} value={JSON.stringify(text)}>
                    {text.companyCode}
                </option>
            ))}
            <option value disabled style={{ textAlign: "center" }}>------------------</option>
            {supplierNotUnitPrice.map((text, i) => (
                <option key={i} value={JSON.stringify(text)}>
                    {text.companyCode}
                </option>
            ))}
        </select>
    );
});
