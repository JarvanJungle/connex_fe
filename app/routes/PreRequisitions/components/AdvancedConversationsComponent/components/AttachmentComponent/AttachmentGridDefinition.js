import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { formatDateTime } from "helper/utilities";
import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

const editableLogicForManualOnly = (params) => params.data.isManual;
const editableLogic = (params) => (params.data.isManual || params.data.isEditable);
const cellClassLogicForManualOnly = (params) => {
    if (params.data.isManual) {
        if (params.rowIndex % 2 === 0) { return "editable-cell"; }
        return "editable-cell-odd";
    } return "";
};
const cellClassLogic = (params) => {
    if (params.data.isEditable || params.data.isManual) {
        if (params.rowIndex % 2 === 0) { return "editable-cell"; }
        return "editable-cell-odd";
    } return "";
};

const columnDefs = [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "viewRenderer",
        cellStyle: () => ({
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        })
    },
    {
        headerName: i18next.t("File Label"),
        field: "fileLabel",
        editable: editableLogic,
        cellClass: cellClassLogic
    },
    {
        headerName: i18next.t("Attachment"),
        field: "attachment",
        cellRenderer: "fileViewRenderer",
        cellStyle: () => ({
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "60%"
        })
    },
    {
        headerName: i18next.t("Description"),
        field: "description",
        editable: editableLogic,
        cellClass: cellClassLogic
    },
    {
        headerName: i18next.t("Updated On"),
        field: "updatedOn",
        valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Uploaded On"),
        field: "uploadedOn",
        valueFormatter: (param) => formatDateTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    }
];

export {
    defaultColDef,
    columnDefs
};
