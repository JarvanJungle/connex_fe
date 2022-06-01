import i18next from "i18next";

const AuditTrailColDefs = [
    {
        headerName: i18next.t("User"),
        field: "userName",
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("Role"),
        field: "userRole",
        suppressSizeToFit: false,
        valueFormatter: ({ data }) => data?.role || data?.userRole || ""
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        suppressSizeToFit: false,
        minWidth: 300,
        cellRenderer: (params) => {
            let { value } = params;
            value = value.replaceAll("_", " ");
            switch (value) {
            case "Draft Saved":
                return "Saved A Contract Request As Draft";
            case "Submit":
                return "Submitted Contract Request";
            case "Cancel":
                return "Cancelled Contract Request";
            case "Recall":
                return "Recalled Contract Request";
            case "Sent Back":
                return "Sent Back Contract Request";
            case "Rejected":
                return "Rejected Contract Request";
            case "Approved":
                return "Approved Contract Request";
            default:
                return value;
            }
        }
    },
    {
        headerName: i18next.t("Date"),
        field: "date",
        suppressSizeToFit: false,
        minWidth: 300,
        sort: "desc",
        valueFormatter: ({ data }) => data?.date || data?.dateTime
    }
];

export default AuditTrailColDefs;
