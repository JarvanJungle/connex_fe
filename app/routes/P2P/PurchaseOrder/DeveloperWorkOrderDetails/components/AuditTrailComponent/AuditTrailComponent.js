import React, { useEffect, useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";

import { defaultColDef, columnDefs } from "./AuditTrailGridDefinition";

import "./AuditTrailComponent.module.scss";

const AuditTrailComponent = (props) => {
    const {
        t,
        rowData
    } = props;

    // const [listStates, setListStates] = useState({
    //     rowData: (rowData || [])
    // });

    const [auditTrailRowData, setAuditTrailRowData] = useState(rowData);

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        params.api.sizeColumnsToFit();
    };

    useEffect(() => {
        setAuditTrailRowData(rowData);
    }, [rowData]);

    return (
        <Row id="auditTrailComponent">
            <Col
                md={12}
                lg={12}
            >
                <Row>
                    <Col
                        md={12}
                        lg={12}
                    >
                        <AgGridReact
                            className="ag-theme-custom-react"
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            rowData={auditTrailRowData}
                            onGridReady={onGridReady}
                            containerStyle={{ height: 300 }}
                            onComponentStateChanged={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    );
};

export default AuditTrailComponent;
