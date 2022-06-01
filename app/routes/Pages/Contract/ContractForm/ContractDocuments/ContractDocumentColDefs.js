import i18next from "i18next";
import { formatDateString } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const editableLogicForManualOnly = (params) => (params.data.isNew && !params.data.isView);

const getContractDocumentColDefs = () => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        cellStyle: (params) => ({
            display: params.data.isNew || params.data.guid ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center"
        }),
        filter: false,
        maxWidth: 120,
        minWidth: 120
    },
    {
        headerName: i18next.t("FileLabel"),
        field: "title",
        editable: editableLogicForManualOnly,
        cellStyle: (params) => ({
            backgroundColor: params.data.isNew ? "#DDEBF7" : "transparent"
        }),
        minWidth: 300
    },
    {
        headerName: i18next.t("Attachment"),
        field: "attachment",
        cellRenderer: "addAttachment",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
        hide: editableLogicForManualOnly,
        minWidth: 300
    },
    {
        headerName: i18next.t("Description"),
        field: "description",
        editable: editableLogicForManualOnly,
        cellStyle: (params) => ({
            backgroundColor: params.data.isNew ? "#DDEBF7" : "transparent"
        }),
        minWidth: 300
    },
    {
        headerName: i18next.t("UploadedOn"),
        field: "uploadOn",
        valueFormatter: ({ value }) => formatDateString(value, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        minWidth: 200,
        sort: "desc"
    },
    {
        headerName: i18next.t("UploadedBy"),
        field: "uploadBy",
        minWidth: 200
    }
];

export default getContractDocumentColDefs;
