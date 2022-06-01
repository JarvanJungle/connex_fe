import React from "react";
import { defaultColDef } from "helper/utilities";
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
        onCellValueChanged,
        defaultColumnDef,
        tooltipShowDelay,
        pagination
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
                defaultColDef={defaultColumnDef || defaultColDef}
                rowData={rowData}
                pagination={pagination}
                paginationPageSize={paginationPageSize || 10}
                onGridReady={onGridReady}
                rowSelection="multiple"
                rowMultiSelectWithClick
                onRowDoubleClicked={onRowDoubleClicked}
                onCellClicked={selectCell}
                suppressRowClickSelection
                onSelectionChanged={onSelectionChanged}
                onCellValueChanged={onCellValueChanged}
                gridOptions={gridOptions}
                getDataPath={getDataPath}
                autoGroupColumnDef={autoGroupColumnDef}
                frameworkComponents={frameworkComponents}
                stopEditingWhenCellsLoseFocus
                tooltipShowDelay={tooltipShowDelay}
                singleClickEdit
            />
        </div>
    );
};

export default ProjectForecastTable;
