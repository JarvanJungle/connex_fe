import React, { useEffect } from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import AgDropdownInput from "components/AgDropdownInput";
import { AgGridTable } from "../AgGridTable";
import getAddItemReqColDefs from "./AddItemReqColDefs";
import CustomTooltip from "./CustomTooltip";
import getItemRequestConvertPPR2PR from "./ItemRequestConvertPPR2PR";
import SelectWithHorizontalLine from "./SelectWithHorizontalLine";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const PRICE_TYPE_DEFAULT = [
    { priceType: "FOC" },
    { priceType: "INCLUDED" },
    { priceType: "TO ADVISE" },
    { priceType: "AS PER CONTRACT" }
];

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

const AddItemRequest = (props) => {
    const {
        rowDataItemReq,
        listAllSuppliers,
        gridHeight,
        onDeleteItem,
        suppliers,
        uoms,
        currencies,
        addresses,
        glAccounts,
        taxRecords,
        onCellValueChanged,
        disabled,
        convertPPR2PR,
        isPurchaseOrderItems,
        isProject,
        isSupplier,
        listCategory,
        isPrePurchaseOrderItems,
        isPendingSubmission,
        priceTypes = PRICE_TYPE_DEFAULT,
        pendingReviewPO
    } = props;
    

    const ActionDelete = (params) => {
        const { data, agGridReact } = params;
        const { rowData } = agGridReact.props;
        return (
            <IconButton
                size="small"
                onClick={() => onDeleteItem(data.uuid, rowData)}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        );
    };

    const SupplerCellRenderer = ({ value }) => value?.supplierCode ?? value?.companyName ?? value ?? "";

    const UOMCellRenderer = ({ value }) => value?.uomName ?? value ?? "";

    const CurrencyCellRenderer = ({ value }) => (value?.currencyName ? `${value?.currencyName} (+${value?.currencyCode})` : value ?? "");

    const TaxRecordCellRenderer = ({ value }) => value?.taxCode ?? value ?? "";

    const PriceTypeCellRenderer = ({ value }) => (typeof value === "object" ? value?.priceType || "" : value || "");

    const AddressCellRenderer = ({ value }) => value?.addressLabel ?? value ?? "";

    const AccountCellRenderer = ({ value }) => value?.accountNumber ?? value ?? "";

    const getColumnDefs = () => {
        if (convertPPR2PR) {
            return getItemRequestConvertPPR2PR(
                suppliers,
                uoms,
                currencies,
                addresses,
                glAccounts,
                taxRecords,
                PRICE_TYPE_DEFAULT,
                disabled,
                isProject,
                isSupplier,
                listCategory,
                isPrePurchaseOrderItems,
                listAllSuppliers
            );
        }
        if (isPendingSubmission && isPrePurchaseOrderItems) {
            return getAddItemReqColDefs(
                suppliers,
                uoms,
                currencies,
                addresses,
                glAccounts,
                taxRecords,
                disabled,
                isPurchaseOrderItems,
                isProject,
                isSupplier,
                listCategory,
                isPrePurchaseOrderItems,
                PRICE_TYPE_DEFAULT,
                isPendingSubmission
            );
        }

        return getAddItemReqColDefs(
            suppliers,
            uoms,
            currencies,
            addresses,
            glAccounts,
            taxRecords,
            disabled,
            isPurchaseOrderItems,
            isProject,
            isSupplier,
            listCategory,
            isPrePurchaseOrderItems,
            PRICE_TYPE_DEFAULT,
            isPendingSubmission,
            pendingReviewPO
        );
    };

    return (
        <AgGridTable
            columnDefs={getColumnDefs()}
            colDef={defaultColDef}
            rowData={rowDataItemReq}
            gridHeight={gridHeight}
            frameworkComponents={{
                actionDelete: ActionDelete,
                supplerCellRenderer: SupplerCellRenderer,
                uomCellRenderer: UOMCellRenderer,
                currencyCellRenderer: CurrencyCellRenderer,
                taxRecordCellRenderer: TaxRecordCellRenderer,
                addressCellRenderer: AddressCellRenderer,
                accountCellRenderer: AccountCellRenderer,
                priceTypeCellRenderer: PriceTypeCellRenderer,
                customTooltip: CustomTooltip,
                editCell: SelectWithHorizontalLine,
                agDropdownInput: AgDropdownInput
            }}
            components={{ datePicker: getDatePicker() }}
            pagination={false}
            onCellValueChanged={onCellValueChanged}
            singleClickEdit
            stopEditingWhenCellsLoseFocus
            autoSizeColumn={false}
        />
    );
};

AddItemRequest.propTypes = {
    rowDataItemReq: PropTypes.instanceOf(Array).isRequired,
    gridHeight: PropTypes.number,
    onDeleteItem: PropTypes.func.isRequired,
    suppliers: PropTypes.instanceOf(Array),
    uoms: PropTypes.instanceOf(Array),
    currencies: PropTypes.instanceOf(Array),
    addresses: PropTypes.instanceOf(Array),
    glAccounts: PropTypes.instanceOf(Array),
    onCellValueChanged: PropTypes.func,
    convertPPR2PR: PropTypes.bool,
    isPurchaseOrderItems: PropTypes.bool,
    isProject: PropTypes.bool,
    isSupplier: PropTypes.bool
};
AddItemRequest.defaultProps = {
    gridHeight: 300,
    suppliers: [],
    uoms: [],
    currencies: [],
    addresses: [],
    glAccounts: [],
    onCellValueChanged: () => { },
    convertPPR2PR: false,
    isPurchaseOrderItems: false,
    isProject: true,
    isSupplier: false
};

export default AddItemRequest;
