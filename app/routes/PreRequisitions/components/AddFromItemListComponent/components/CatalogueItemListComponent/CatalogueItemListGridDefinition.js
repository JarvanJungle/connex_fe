import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatDateTime } from "helper/utilities";
import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

const columnDefs = [
    {
        headerName: i18next.t("Item Name"),
        field: "catalogueItemName",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true
    },
    {
        headerName: i18next.t("Item Description"),
        field: "description"
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel"
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize"
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand"
    },
    {
        headerName: i18next.t("Type"),
        field: "itemType"
    },
    {
        headerName: i18next.t("Category"),
        field: "itemCategory"
    },
    {
        headerName: i18next.t("Material"),
        field: "itemMaterial"
    },
    {
        headerName: i18next.t("UOM"),
        field: "uomCode"
    },
    {
        headerName: i18next.t("Update At"),
        field: "updateOn",
        valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    }
];

export {
    defaultColDef,
    columnDefs
};
