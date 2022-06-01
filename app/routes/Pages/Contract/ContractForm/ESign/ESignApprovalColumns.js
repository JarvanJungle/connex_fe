import i18next from "i18next";

const getEsignApproverRouteColDefs = () => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        cellStyle: (params) => ({
            display: params.data.isNew ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center"
        }),
        filter: false
    },
    {
        headerName: i18next.t("S/N"),
        field: "sn",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" }
    },
    {
        headerName: i18next.t("Name"),
        field: "name",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" }
    },
    {
        headerName: i18next.t("Email"),
        field: "email",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" }
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" }
    }
];

export default getEsignApproverRouteColDefs;
