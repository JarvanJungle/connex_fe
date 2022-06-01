import React from "react";
import { defaultColDef } from "helper/utilities";
import {
    AgGridReact
} from "components/agGrid";

const VendorGrid = (props) => {
    const {
        columnDefs,
        rowData,
        gridOptions,
        onGridReady,
        onCellClicked,
        onRowDoubleClicked,
        paginationPageSize,
        onSelectionChanged,
        frameworkComponents,
        width,
        height
    } = props;

    return (
        <div
            className="ag-theme-custom-react"
            style={{ height: height || "580px", width: width || "auto" }}
        >
            <AgGridReact
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                pagination
                paginationPageSize={paginationPageSize || 10}
                onGridReady={onGridReady}
                onRowDoubleClicked={onRowDoubleClicked}
                suppressRowClickSelection
                onSelectionChanged={onSelectionChanged}
                frameworkComponents={frameworkComponents}
                onCellClicked={onCellClicked}
                singleClickEdit
                stopEditingWhenCellsLoseFocus
                gridOptions={gridOptions}
            />
        </div>
    );
};
export default VendorGrid;
