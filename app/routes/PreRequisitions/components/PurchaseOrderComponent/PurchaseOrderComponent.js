import React, { useEffect, useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";
import "ag-grid-enterprise";
import { defaultColDef, columnDefs } from "./PurchaseOrderGridDefinition";

const PurchaseOrderComponent = (props) => {
    const {
        values,
        setFieldValue,
        showToast
    } = props;

    const [purchaseOrderRowData, setPurchaseOrderRowData] = useState([]);

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    useEffect(() => {
        setPurchaseOrderRowData(values.purchaseOrderDetails);
    }, [values.purchaseOrderDetails]);

    return (
        <Row id="purchaseOrderComponent">
            <Col
                md={12}
                lg={12}
            >
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={purchaseOrderRowData}
                    onGridReady={onGridReady}
                    containerStyle={{ height: 400 }}
                    treeData="true"
                    animateRows="true"
                    getDataPath={(data) => data.tradeCode}
                    autoGroupColumnDef={{
                        headerName: "Trade Code",
                        minWidth: 300,
                        cellRendererParams: { suppressCount: true }
                    }}
                />
            </Col>
        </Row>
    );
};

export default PurchaseOrderComponent;
