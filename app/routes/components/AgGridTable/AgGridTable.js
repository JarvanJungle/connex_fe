import React, { useEffect, useState } from "react";
import { defaultColDef } from "helper/utilities";
import {
    AgGridReact
} from "components/agGrid";
import "ag-grid-enterprise";
import PropTypes from "prop-types";
import AgDropdownSelection from "components/AgDropdownSelection";

const AgGridTable = (props) => {
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
        onCellEditingStopped,
        pagination,
        onGridSizeChanged,
        onViewportChanged,
        onComponentStateChanged,
        onCellValueChanged,
        singleClickEdit,
        components,
        stopEditingWhenCellsLoseFocus,
        sizeColumnsToFit,
        tooltipShowDelay,
        colDef,
        treeData,
        className,
        autoSizeColumn,
        isExternalFilterPresent,
        doesExternalFilterPass,
        onRowSelected,
        onRowDataChanged,
        onRowDataUpdated,
        animateRows,
        groupDisplayType,
        isGroupOpenByDefault,
        groupDefaultExpanded,
        context,
        suppressColumnVirtualisation,
        pinnedBottomRowData,
        getRowStyle,
        getRowHeight,
        suppressRowHoverHighlight,
        rowDataUpdated
    } = props;

    const [columnApi, setColumnApi] = useState(null);

    const autoSizeAll = () => {
        const allColumnIds = [];
        columnApi.getAllColumns().forEach((column) => {
            allColumnIds.push(column.colId);
        });
        columnApi.autoSizeColumns(allColumnIds, false);
    };

    useEffect(() => {
        if (columnApi && !sizeColumnsToFit && autoSizeColumn) {
            setTimeout(() => {
                autoSizeAll(columnApi);
            }, 100);
        }
    }, [rowData]);

    const onGridReadyFunc = (params) => {
        onGridReady(params);
        if (sizeColumnsToFit) {
            params.api.sizeColumnsToFit();
        }
        setColumnApi(params.columnApi);
    };

    return (
        <div
            id="agGridReact"
            className={className}
            style={{ height: `${gridHeight}px` }}
        >
            <AgGridReact
                className="ag-theme-custom-react"
                overlayLoadingTemplate={overlayLoadingTemplate}
                overlayNoRowsTemplate={overlayNoRowsTemplate}
                columnDefs={columnDefs}
                defaultColDef={colDef || defaultColDef}
                rowData={rowData}
                paginationPageSize={paginationPageSize}
                onGridReady={(params) => onGridReadyFunc(params)}
                rowSelection="multiple"
                rowMultiSelectWithClick
                onRowDoubleClicked={onRowDoubleClicked}
                onCellClicked={selectCell}
                suppressRowClickSelection
                onSelectionChanged={onSelectionChanged}
                gridOptions={gridOptions}
                getDataPath={getDataPath}
                autoGroupColumnDef={autoGroupColumnDef}
                frameworkComponents={{
                    ...frameworkComponents,
                    agDropdownSelection: AgDropdownSelection
                }}
                onCellEditingStopped={onCellEditingStopped}
                pagination={pagination}
                onGridSizeChanged={onGridSizeChanged}
                onViewportChanged={onViewportChanged}
                onComponentStateChanged={onComponentStateChanged}
                onCellValueChanged={onCellValueChanged}
                singleClickEdit={singleClickEdit}
                components={components}
                stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
                tooltipShowDelay={tooltipShowDelay || 0}
                treeData={treeData}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
                onRowSelected={onRowSelected}
                onRowDataChanged={onRowDataChanged}
                onRowDataUpdated={onRowDataUpdated}
                animateRows={animateRows}
                groupDisplayType={groupDisplayType}
                isGroupOpenByDefault={isGroupOpenByDefault}
                groupDefaultExpanded={groupDefaultExpanded}
                context={context}
                suppressColumnVirtualisation={suppressColumnVirtualisation}
                pinnedBottomRowData={pinnedBottomRowData}
                getRowStyle={getRowStyle}
                getRowHeight={getRowHeight}
                suppressRowHoverHighlight={suppressRowHoverHighlight}
                rowDataUpdated={rowDataUpdated}
            />
        </div>
    );
};

AgGridTable.propTypes = {
    columnDefs: PropTypes.instanceOf(Object).isRequired,
    rowData: PropTypes.instanceOf(Array),
    overlayLoadingTemplate: PropTypes.string,
    overlayNoRowsTemplate: PropTypes.string,
    onGridReady: PropTypes.func,
    onRowDoubleClicked: PropTypes.func,
    paginationPageSize: PropTypes.number,
    selectCell: PropTypes.func,
    onSelectionChanged: PropTypes.func,
    gridHeight: PropTypes.number,
    gridOptions: PropTypes.instanceOf(Object),
    getDataPath: PropTypes.func,
    autoGroupColumnDef: PropTypes.instanceOf(Object),
    frameworkComponents: PropTypes.instanceOf(Object),
    onCellEditingStopped: PropTypes.func,
    pagination: PropTypes.bool,
    onGridSizeChanged: PropTypes.func,
    onViewportChanged: PropTypes.func,
    onComponentStateChanged: PropTypes.func,
    onCellValueChanged: PropTypes.func,
    singleClickEdit: PropTypes.bool,
    components: PropTypes.instanceOf(Object),
    stopEditingWhenCellsLoseFocus: PropTypes.bool,
    sizeColumnsToFit: PropTypes.bool,
    tooltipShowDelay: PropTypes.number,
    treeData: PropTypes.bool,
    className: PropTypes.string,
    autoSizeColumn: PropTypes.bool,
    isExternalFilterPresent: PropTypes.func,
    doesExternalFilterPass: PropTypes.func,
    onRowSelected: PropTypes.func,
    onRowDataChanged: PropTypes.func,
    onRowDataUpdated: PropTypes.func,
    suppressColumnVirtualisation: PropTypes.bool,
    pinnedBottomRowData: PropTypes.instanceOf(Array),
    getRowStyle: PropTypes.func,
    getRowHeight: PropTypes.func,
    suppressRowHoverHighlight: PropTypes.bool,
    rowDataUpdated: PropTypes.func
};
AgGridTable.defaultProps = {
    rowData: [],
    overlayLoadingTemplate: "",
    overlayNoRowsTemplate: "",
    onGridReady: () => { },
    onRowDoubleClicked: () => { },
    paginationPageSize: 10,
    selectCell: () => { },
    onSelectionChanged: () => { },
    gridHeight: 500,
    gridOptions: null,
    getDataPath: () => { },
    autoGroupColumnDef: null,
    frameworkComponents: null,
    onCellEditingStopped: () => { },
    pagination: true,
    onGridSizeChanged: () => { },
    onViewportChanged: () => { },
    onComponentStateChanged: () => { },
    onCellValueChanged: () => { },
    singleClickEdit: false,
    components: null,
    stopEditingWhenCellsLoseFocus: false,
    sizeColumnsToFit: false,
    tooltipShowDelay: 0,
    treeData: false,
    className: "ag-theme-custom-react",
    autoSizeColumn: true,
    isExternalFilterPresent: () => false,
    doesExternalFilterPass: () => {},
    onRowSelected: () => { },
    onRowDataChanged: () => { },
    onRowDataUpdated: () => { },
    suppressColumnVirtualisation: false,
    pinnedBottomRowData: [],
    getRowStyle: () => { },
    getRowHeight: () => { },
    suppressRowHoverHighlight: false,
    rowDataUpdated: () => { }
};

export default AgGridTable;
