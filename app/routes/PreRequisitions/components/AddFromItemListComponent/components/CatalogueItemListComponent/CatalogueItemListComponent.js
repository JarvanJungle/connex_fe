import React, { useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridReact } from "components/agGrid";
import { defaultColDef, columnDefs } from "./CatalogueItemListGridDefinition";

const CatalogueItemListComponent = (props) => {
    const {
        rowData,
        setFieldValue,
        gridRef
    } = props;

    const [listStates, setListStates] = useState({
        rowData: (rowData || [])
    });

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    return (
        <Row id="catalogueItemListComponent">
            <Col
                md={12}
                lg={12}
            >
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowData={listStates.rowData}
                    onGridReady={onGridReady}
                    containerStyle={{ height: 400 }}
                    rowSelection="multiple"
                    rowMultiSelectWithClick
                    ref={gridRef}
                />
            </Col>
        </Row>
    );
};

export default CatalogueItemListComponent;
