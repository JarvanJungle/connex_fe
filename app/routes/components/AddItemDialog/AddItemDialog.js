import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    Row,
    Col,
    Input,
    Label
} from "components";
import i18next from "i18next";
import CustomTooltip from "routes/P2P/GoodReceipts/components/CustomTooltip";
import { makeStyles } from "@material-ui/core/styles";
import AgGridTableBackend from "components/AgTableBackend";
import * as _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { AgGridTable } from "../AgGridTable";
import { CommonConfirmDialog } from "../CommonConfirmDialog";

const useStyles = makeStyles({
    "width-search-section": {
        width: "50%",
        "@media (max-width: 978px)": {
            width: "100%"
        }
    }
});

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const AddItemDialog = (props) => {
    const {
        isShow,
        onHide,
        title,
        onPositiveAction,
        contentPositive,
        colorPositive,
        onNegativeAction,
        columnDefs,
        rowDataItem,
        onSelectionChanged,
        autoFitColumn,
        hideSearch,
        pageSize,
        backendPagination,
        backendServerConfig,
        selected,
        getRowNodeId
    } = props;
    const [gridApi, setGridApi] = useState(null);
    const [quickFilter, setQuickFilter] = useState("");
    const classes = useStyles();

    useEffect(() => {
        if (isShow) setQuickFilter("");
    }, [isShow]);

    const setFilterDebounced = _.debounce((text) => setQuickFilter(text), 1000);

    return (
        <CommonConfirmDialog
            isShow={isShow}
            onHide={onHide}
            title={title}
            positiveProps={
                {
                    onPositiveAction,
                    contentPositive,
                    colorPositive
                }
            }
            negativeProps={
                {
                    onNegativeAction
                }
            }
            size="xl"
            centered
            titleCenter
        >
            <Row className={`mb-3 align-items-center ${classes["width-search-section"]}`} style={{ display: !hideSearch ? "flex" : "none" }}>
                <Col xs="2" className="d-flex align-items-center pt-1">
                    <Label className="mb-0">Search</Label>
                </Col>
                <Col xs="10">
                    <Input
                        placeholder="Enter key words"
                        type="search"
                        onChange={(e) => (backendPagination
                            ? setFilterDebounced(e.target.value)
                            : gridApi.setQuickFilter(e.target.value))}
                    />
                </Col>
            </Row>
            {backendPagination ? (
                <AgGridTableBackend
                    gridHeight={500}
                    backendServerConfig={backendServerConfig}
                    columnDefs={columnDefs}
                    onGridReady={({ api }) => {
                        setGridApi(api);
                    }}
                    onSelectionChanged={onSelectionChanged}
                    pageSize={pageSize}
                    defaultColDef={defaultColDef}
                    quickFilterText={quickFilter}
                    frameworkComponents={{
                        customTooltip: CustomTooltip
                    }}
                    context={{ selected }}
                    getRowNodeId={getRowNodeId}
                />
            )
                : (
                    <AgGridTable
                        columnDefs={columnDefs}
                        rowData={rowDataItem}
                        onGridReady={(params) => {
                            if (autoFitColumn) params.api.sizeColumnsToFit();
                            setGridApi(params.api);
                        }}
                        onSelectionChanged={onSelectionChanged}
                        pagination={!!pageSize}
                        paginationPageSize={pageSize}
                        colDef={defaultColDef}
                        frameworkComponents={{
                            customTooltip: CustomTooltip
                        }}
                    />
                )}
        </CommonConfirmDialog>
    );
};

AddItemDialog.propTypes = {
    isShow: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    onPositiveAction: PropTypes.func.isRequired,
    contentPositive: PropTypes.string,
    colorPositive: PropTypes.string,
    onNegativeAction: PropTypes.func.isRequired,
    columnDefs: PropTypes.instanceOf(Array).isRequired,
    rowDataItem: PropTypes.instanceOf(Array).isRequired,
    onSelectionChanged: PropTypes.func.isRequired,
    autoFitColumn: PropTypes.bool,
    pageSize: PropTypes.number,
    backendPagination: PropTypes.bool,
    getRowNodeId: PropTypes.func
};
AddItemDialog.defaultProps = {
    contentPositive: `${i18next.t("Add")}`,
    colorPositive: "primary",
    autoFitColumn: false,
    pageSize: 0,
    backendPagination: false,
    getRowNodeId: () => uuidv4()
};

export default AddItemDialog;
