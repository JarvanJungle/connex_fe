import React, { useEffect, useState } from "react";

import {
    Row,
    Col
} from "components";
import { AgGridColumn, AgGridReact } from "components/agGrid";
import { convertDate2String } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { IconButton } from "@material-ui/core";
import EditCell from "routes/PreRequisitions/RaisePreRequisitions/components/EditCell";
import AgDropdownSelection from "components/AgDropdownSelection";
import { defaultColDef } from "./AddingOfItemsGridDefinition";
import CustomTooltip from "./CustomAddItemTooltip";

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

const numericCellEditor = () => {
    function NumericCellEditor() { }
    NumericCellEditor.prototype.init = function (params) {
        this.eInput = document.createElement("input");
        this.eInput.setAttribute("type", "number");
        this.eInput.classList.add("form-control");
        this.eInput.style.cssText = "height: 42px";
        this.cell = params.eGridCell;
        this.oldWidth = this.cell.style.width;
        this.cell.style.width = "120px";
        this.cell.style.height = "42px";
        this.eInput.value = params.value;
    };
    NumericCellEditor.prototype.getGui = function () {
        return this.eInput;
    };
    NumericCellEditor.prototype.afterGuiAttached = function () {
        this.eInput.focus();
        this.eInput.select();
    };
    NumericCellEditor.prototype.getValue = function () {
        this.cell.style.width = this.oldWidth;
        return this.eInput.value;
    };
    NumericCellEditor.prototype.destroy = function () { };
    NumericCellEditor.prototype.isPopup = function () {
        return false;
    };

    return NumericCellEditor;
};

const AddingOfItemsComponent = (props) => {
    const {
        rowData,
        values,
        setFieldValue,
        gridRef,
        listAddress,
        uomList,
        listCategory,
        suppliers,
        setContracted,
        contracted
    } = props;

    const [addingRowData, setAddingRowData] = useState(rowData);
    const [agGridApi, setAgGridApi] = useState(null);

    const handleRemoveRow = (params) => {
        const rowToDelete = params.node.data;
        params.api.applyTransaction({ remove: [rowToDelete] });
        const arr = [];
        params.api.forEachNode((node) => arr.push(node.data));
        setContracted(arr.length > 0 ? arr[0]?.contracted : false);
        setFieldValue("addingItemFromList", arr);
    };

    const viewRenderer = (params) => (
        <IconButton size="small" onClick={() => handleRemoveRow(params)} style={{ color: "red" }}>
            <i className="fa fa-trash" />
        </IconButton>
    );

    // const onCellValueChanged = (params) => {
    //     const colId = params.column.getId();
    //     console.log(params);
    //     if (colId === "deliveryAddress") {
    //         console.log("deliveryAddress", listAddress);
    //         console.log("uomList", uomList);
    //         console.log(params.data);
    //     }
    // };

    const editableLogicForManualOnly = (params) => {
        if (!values.isEdit) {
            return false;
        }
        return (params.data.manualEntry && !params.data.isView);
    };

    const editableLogicForCategory = (params) => {
        if (!values.isEdit || !params.data.manualEntry) { return false; }
        return true;
    };

    const editableLogic = (params) => {
        if (!values.isEdit) {
            return false;
        }
        return (params.data.isEditable || params.data.manualEntry) && !params.data.isView;
    };

    const cellStyleLogic = (params) => {
        if (!values.isEdit) {
            return {};
        }
        if ((params.data.isEditable || params.data.manualEntry) && !params.data.isView) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        } return {};
    };

    const cellStyleQuantity = (params) => {
        if (!values.isEdit) {
            return {
                textAlign: "right"
            };
        }
        if ((params.data.isEditable || params.data.manualEntry) && !params.data.isView) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB",
                textAlign: "right"
            };
        } return {
            textAlign: "right"
        };
    };

    const cellStyleLogicForManualOnly = (params) => {
        if (!values.isEdit) {
            return "";
        }
        if (params.data.manualEntry && !params.data.isView) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        } return "";
    };

    const cellStyleLogicForCategory = (params) => {
        if (!values.isEdit || !params.data.isManual) {
            return "";
        }
        if (params.data.manualEntry && !params.data.isView) {
            return {
                backgroundColor: "#DDEBF7",
                border: "1px solid #E4E7EB"
            };
        } return "";
    };

    useEffect(() => {
        setTimeout(() => {
            setAddingRowData(values.addingItemFromList);
        });
    }, [values.addingItemFromList, values.isEdit]);

    useEffect(() => {
        agGridApi?.redrawRows();
    });

    return (
        <Row id="addingOfItemsComponent">
            <Col
                md={12}
                lg={12}
            >
                <AgGridReact
                    className="ag-theme-custom-react"
                    defaultColDef={defaultColDef}
                    rowData={addingRowData}
                    containerStyle={{ height: 400 }}
                    frameworkComponents={{
                        viewRenderer,
                        customTooltip: CustomTooltip,
                        editCell: EditCell,
                        agDropdownSelection: AgDropdownSelection
                    }}
                    singleClickEdit
                    ref={gridRef}
                    onGridReady={(params) => setAgGridApi(params.api)}
                    components={{
                        datePicker: getDatePicker(),
                        numericCellEditor: numericCellEditor()
                    }}
                    stopEditingWhenCellsLoseFocus
                    tooltipShowDelay={0}
                >
                    <AgGridColumn
                        field="action"
                        cellRenderer="viewRenderer"
                        cellStyle={(params) => ({
                            display: params.data.isView ? "none" : "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        })}
                        width={100}
                        filter={false}
                        hide={!values.isEdit}
                    />
                    <AgGridColumn
                        headerName="Item Code"
                        field="itemCode"
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                        valueGetter={(params) => params.data?.itemCode?.slice(0, 20)}
                        width={150}
                    />
                    <AgGridColumn
                        field="itemName"
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                        valueGetter={(params) => params.data?.itemName?.slice(0, 200)}
                        width={200}
                    />
                    <AgGridColumn
                        field="itemCategory"
                        headerName="Category"
                        valueFormatter={(params) => (params.value?.categoryName)}
                        cellEditor="agDropdownSelection"
                        cellEditorParams={{
                            values: listCategory,
                            getOption: ({ categoryName }) => (
                                { label: categoryName, value: categoryName }
                            )
                        }}
                        editable={editableLogicForCategory}
                        cellStyle={cellStyleLogicForCategory}
                        width={120}
                    />
                    {values.isEdit ? (
                        <AgGridColumn
                            field="itemDescription"
                            headerName="Item Description"
                            editable={editableLogicForManualOnly}
                            cellStyle={cellStyleLogicForManualOnly}
                            cellEditor="agLargeTextCellEditor"
                            cellEditorParams={{ maxLength: 250 }}
                            width={200}
                        />
                    )
                        : (
                            <AgGridColumn
                                headerName="Item Description"
                                field="itemDescription"
                                width={200}
                                tooltipField="itemDescription"
                            />
                        )}
                    <AgGridColumn
                        field="itemModel"
                        headerName="Model"
                        valueGetter={(params) => params.data?.itemModel?.slice(0, 200)}
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                    />
                    <AgGridColumn
                        field="itemSize"
                        headerName="Size"
                        valueGetter={(params) => params.data?.itemSize?.slice(0, 200)}
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                    />
                    <AgGridColumn
                        field="itemBrand"
                        headerName="Brand"
                        valueGetter={(params) => params.data?.itemBrand?.slice(0, 200)}
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                        width={150}
                    />
                    <AgGridColumn
                        field="supplier"
                        editable={editableLogic}
                        valueFormatter={({ value }) => (value?.companyName ?? value ?? "")}
                        cellEditor="agDropdownSelection"
                        cellEditorParams={{
                            values: suppliers,
                            getOption: (value) => (
                                { label: value?.companyName, value: value?.uuid }
                            )
                        }}
                        cellStyle={cellStyleLogic}
                        width={150}
                        hide={!contracted}
                    />
                    <AgGridColumn
                        field="uomCode"
                        headerName="UOM"
                        valueFormatter={(params) => (params.value?.uomName)}
                        cellEditor="agDropdownSelection"
                        cellEditorParams={{
                            values: uomList,
                            getOption: (value) => ({ label: value?.uomName, value: value?.uomCode })
                        }}
                        editable={editableLogicForManualOnly}
                        cellStyle={cellStyleLogicForManualOnly}
                        width={120}
                    />
                    <AgGridColumn
                        field="quantity"
                        editable={editableLogic}
                        cellStyle={cellStyleQuantity}
                        width={120}
                        cellEditor="numericCellEditor"
                    />
                    <AgGridColumn
                        field="deliveryAddress"
                        editable={editableLogic}
                        valueFormatter={(params) => (params.value?.addressLabel)}
                        cellEditor="agDropdownSelection"
                        cellEditorParams={{
                            values: listAddress,
                            getOption: (value) => (
                                { label: value?.addressLabel, value: value?.uuid }
                            )
                        }}
                        cellStyle={cellStyleLogic}
                        width={150}
                    />
                    <AgGridColumn
                        field="requestDeliveryDate"
                        editable={editableLogic}
                        cellEditor="datePicker"
                        cellRenderer={(params) => {
                            const { value } = params;
                            if (value) {
                                return convertDate2String(
                                    new Date(value), CUSTOM_CONSTANTS.DDMMYYYY
                                );
                            }
                            return "";
                        }}
                        cellStyle={cellStyleLogic}
                        width={150}
                    />
                    {values.isEdit
                        ? (
                            <AgGridColumn
                                field="note"
                                editable={editableLogic}
                                minWidth="200"
                                cellEditor="agLargeTextCellEditor"
                                cellEditorParams={{ maxLength: 500 }}
                                cellStyle={cellStyleLogic}
                                width={180}
                            />
                        )
                        : (
                            <AgGridColumn
                                headerName="Note"
                                field="note"
                                width={200}
                                tooltipField="note"
                            />
                        )}
                </AgGridReact>
            </Col>
        </Row>
    );
};

export default AddingOfItemsComponent;
