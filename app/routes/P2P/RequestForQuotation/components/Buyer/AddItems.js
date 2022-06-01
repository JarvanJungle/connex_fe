import React, { useEffect, useMemo, useState } from "react";
import IconButton from "@material-ui/core/IconButton";
import { AgGridTable } from "routes/components";
import { Row } from "components";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { roundNumberWithUpAndDown } from "helper/utilities";
import { getAddItemsColDefs } from "../../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const getDatePicker = () => {
    function Datepicker() { }
    Datepicker.prototype.init = function (params) {
        this.eInput = document.createElement("input");
        this.eInput.setAttribute("type", "date");
        this.eInput.classList.add("form-control");
        this.eInput.style.cssText = "height: 42px";
        this.cell = params.eGridCell;
        this.oldWidth = this.cell.style.width;
        this.cell.style.width = "200px";
        this.cell.style.height = "42px";
        this.eInput.value = params.value;
    };
    Datepicker.prototype.getGui = function () {
        return this.eInput;
    };
    Datepicker.prototype.afterGuiAttached = function () {
        this.eInput.focus();
        this.eInput.select();
    };
    Datepicker.prototype.getValue = function () {
        this.cell.style.width = this.oldWidth;
        return this.eInput.value;
    };
    Datepicker.prototype.destroy = function () { };
    Datepicker.prototype.isPopup = function () {
        return false;
    };

    return Datepicker;
};

const AddItems = (props) => {
    const {
        t,
        gridHeight,
        onDeleteItem,
        onCellValueChanged,
        onGridReady,
        addresses,
        isProject,
        uoms,
        currencies,
        subTotal,
        tax,
        total,
        gridApi,
        showTotal,
        disabled,
        values
    } = props;

    const [rowData, setRowData] = useState([]);

    const columnDefs = useMemo(() => getAddItemsColDefs(
        addresses, disabled, isProject, uoms, currencies
    ), [addresses, disabled, isProject, uoms, currencies]);

    const getRowData = () => {
        if (!gridApi) return [];
        const items = [];
        gridApi.forEachNode((node) => {
            if (node?.data) items.push(node.data);
        });
        return items;
    };

    const ActionDelete = (params) => {
        const { data } = params;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    useEffect(() => {
        if (gridApi) {
            gridApi.refreshCells();
            gridApi.redrawRows();
        }
    }, [addresses, disabled, isProject, uoms, currencies, gridApi]);

    const onRowDataChanged = () => {
        setRowData(getRowData());
    };

    return (
        <>
            <AgGridTable
                columnDefs={columnDefs}
                colDef={defaultColDef}
                rowDataUpdated={onRowDataChanged}
                onRowDataChanged={onRowDataChanged}
                gridHeight={
                    ([...getRowData()].length || rowData.length) ? gridHeight : 155
                }
                frameworkComponents={{
                    actionDelete: ActionDelete,
                    customTooltip: CustomTooltip
                }}
                components={{ datePicker: getDatePicker() }}
                pagination={false}
                onCellValueChanged={onCellValueChanged}
                onGridReady={onGridReady}
                singleClickEdit
                stopEditingWhenCellsLoseFocus
                autoSizeColumn={false}
                context={{
                    disabled
                }}
            />
            {showTotal && (
                <Row className="mx-0 align-items-end flex-column mb-4 text-secondary" style={{ fontSize: "1rem" }}>
                    <div style={{ textDecoration: "underline" }}>
                        {t("InDocumentCurrency")}
                    </div>
                    <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                        <div style={{ width: "200px" }}>
                            <div>{`${t("SubTotal")}:`}</div>
                            <div>{`${t("Tax")}:`}</div>
                            <div>{`${t("Total(include GST)")}:`}</div>
                        </div>
                        <div style={{ width: "100px" }}>
                            <div>{values?.currencyCode}</div>
                            <div>{values?.currencyCode}</div>
                            <div>{values?.currencyCode}</div>
                        </div>
                        <div style={{ marginLeft: "40px" }}>
                            <div>{roundNumberWithUpAndDown(subTotal, 2) || "0.00"}</div>
                            <div>{roundNumberWithUpAndDown(tax, 2) || "0.00"}</div>
                            <div>{roundNumberWithUpAndDown(total, 2) || "0.00"}</div>
                        </div>
                    </Row>
                </Row>
            )}
        </>
    );
};

export default AddItems;
