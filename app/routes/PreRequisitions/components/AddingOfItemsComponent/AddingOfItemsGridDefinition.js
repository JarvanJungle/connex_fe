import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true.valueOf,
    tooltipComponent: "customTooltip"
};

const editableLogicForManualOnly = (params) => (params.data.manualEntry && !params.data.isView);
const editableLogic = (params) => (
    (params.data.isEditable || params.data.manualEntry) && !params.data.isView);
const cellClassLogicForManualOnly = (params) => {
    if (params.data.manualEntry && !params.data.isView) {
        if (params.rowIndex % 2 === 0) { return "editable-cell"; }
        return "editable-cell-odd";
    } return "";
};
const cellClassLogic = (params) => {
    if ((params.data.isEditable || params.data.manualEntry) && !params.data.isView) {
        if (params.rowIndex % 2 === 0) { return "editable-cell"; }
        return "editable-cell-odd";
    } return "";
};

const columnDefs = [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "viewRenderer",
        cellStyle: (params) => ({
            display: params.data.isView ? "none" : "flex",
            justifyContent: "center",
            alignItems: "center"
        }),
        floatingFilterComponentParams: { suppressFilterButton: true },
        filter: false
    },
    {
        headerName: `${i18next.t("Item Code")} *`,
        field: "itemCode",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: `${i18next.t("Item Name")} *`,
        field: "itemName",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: `${i18next.t("Item Description")} *`,
        field: "description",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: i18next.t("Model"),
        field: "itemModel",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: i18next.t("Size"),
        field: "itemSize",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: i18next.t("Brand"),
        field: "itemBrand",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: `${i18next.t("UOM")} *`,
        field: "uomCode",
        editable: editableLogicForManualOnly,
        cellClass: cellClassLogicForManualOnly
    },
    {
        headerName: `${i18next.t("Quantity")} *`,
        field: "quantity",
        editable: editableLogic,
        cellClass: cellClassLogic
    },
    {
        headerName: i18next.t("DeliveryAddress"),
        field: "deliveryAddress",
        valueFormatter: (params) => (params.value?.addressLabel)
    },
    {
        headerName: i18next.t("Requested Delivery Date"),
        field: "requestDeliveryDate"
    },
    {
        headerName: i18next.t("Note"),
        field: "note",
        editable: editableLogic,
        cellClass: cellClassLogic
    }
];

export {
    defaultColDef,
    columnDefs
};
