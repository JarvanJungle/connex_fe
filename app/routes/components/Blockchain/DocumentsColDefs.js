import i18next from "i18next";

const DocumentsColDefs = [
    {
        headerName: i18next.t("Type"),
        field: "type"
    },
    {
        headerName: i18next.t("Hash"),
        field: "hash"
    },
    {
        headerName: i18next.t("Transaction"),
        field: "transaction"
    },
    {
        headerName: i18next.t("DocumentStatus"),
        field: "documentStatus"
    },
    {
        headerName: i18next.t("TimeStamp"),
        field: "timeStamp"
    }
];

export default DocumentsColDefs;
