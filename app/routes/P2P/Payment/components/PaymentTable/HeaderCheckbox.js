import { Checkbox } from "primereact/checkbox";
import React, { Component, useEffect, useState } from "react";

const HeaderCheckbox = (props) => {
    const [checked, setChecked] = useState(false);

    const selectAllRows = () => {
        const newRowData = [...props.agGridReact.props.rowData];

        newRowData.forEach((item, index) => {
            newRowData[index].completedPay = true;
            newRowData[index].amountToPay = newRowData[index].pendingPaymentAmount;
        });
        props.api.setRowData(newRowData);
    };

    const updateState = (e) => {
        setChecked(true);
        selectAllRows();
    };

    useEffect(() => {
        const { agGridReact } = props;
        if (agGridReact) {
            const newRowData = [...agGridReact?.props?.rowData];
            newRowData[0].selectAll = true;
            newRowData.forEach((item) => {
                if (!item.completedPay) {
                    newRowData[0].selectAll = false;
                }
            });
            if (newRowData[0].selectAll === true) {
                setChecked(true);
            } else {
                setChecked(false);
            }
        }
    }, [props]);

    return (
        <div className="d-flex justify-content-center align-items-center ml-4">
            <Checkbox
                name="checkHeader"
                checked={checked}
                value={checked}
                onMouseDown={updateState}
            />
            <div className="ml-2">Pay All</div>
        </div>
    );
};
export default HeaderCheckbox;
