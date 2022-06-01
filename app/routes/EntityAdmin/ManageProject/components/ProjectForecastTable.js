import React from "react";
import {
    AgGridReact
} from "components/agGrid";
import "ag-grid-enterprise";

const ProjectForecastTable = (props) => {
    const {
        columnDefs,
        rowData,
        overlayLoadingTemplate,
        overlayNoRowsTemplate,
        onGridReady,
        onRowDoubleClicked,
        paginationPageSize,
        selectCell,
        onSelectionChanged,
        gridHeight,
        gridOptions,
        getDataPath,
        autoGroupColumnDef,
        frameworkComponents,
        tooltipShowDelay,
        defaultColDef
    } = props;

    return (
        <div
            className="ag-theme-custom-react"
            style={{ height: `${gridHeight || 500}px` }}
        >
            <AgGridReact
                overlayLoadingTemplate={overlayLoadingTemplate}
                overlayNoRowsTemplate={overlayNoRowsTemplate}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowData={rowData}
                pagination
                paginationPageSize={paginationPageSize || 10}
                onGridReady={onGridReady}
                rowSelection="multiple"
                rowMultiSelectWithClick
                onRowDoubleClicked={onRowDoubleClicked}
                onCellClicked={selectCell}
                suppressRowClickSelection
                onSelectionChanged={onSelectionChanged}
                gridOptions={gridOptions}
                getDataPath={getDataPath}
                autoGroupColumnDef={autoGroupColumnDef}
                frameworkComponents={frameworkComponents}
                tooltipShowDelay={tooltipShowDelay}
            />
        </div>
    );
};

export default ProjectForecastTable;
