import i18next from "i18next";

const RolesListColDefs = [
    {
        headerName: i18next.t("FeatureName"),
        field: "feature.featureName"
    },
    {
        headerName: i18next.t("Read"),
        field: "read",
        cellRenderer: "readRender",
        filter: false
    },
    {
        headerName: i18next.t("Write"),
        field: "write",
        cellRenderer: "writeRender",
        filter: false
    },
    {
        headerName: i18next.t("Approve"),
        field: "approve",
        cellRenderer: "approveRender",
        filter: false
    }
];

export default RolesListColDefs;
