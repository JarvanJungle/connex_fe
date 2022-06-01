import i18next from "i18next";

const AuditTrailDOColDefs = [
    {
        headerName: i18next.t("User"),
        field: "userName",
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("Role"),
        field: "role",
        suppressSizeToFit: false,
        valueFormatter: ({ data }) => data.role || data.userRole
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        suppressSizeToFit: false,
        minWidth: 300
    },
    {
        headerName: i18next.t("Date"),
        field: "date",
        suppressSizeToFit: false,
        minWidth: 300,
        valueFormatter: ({ data }) => data?.date || data?.dateTime,
        valueGetter: ({ data }) => data?.date || data?.dateTime,
        sort: "desc"
    }
];

export default AuditTrailDOColDefs;
