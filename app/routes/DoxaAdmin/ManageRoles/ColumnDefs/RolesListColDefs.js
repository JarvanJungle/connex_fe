import i18next from "i18next";
import { convertToLocalTime } from "helper/utilities";

const RolesListColDefs = [
    {
        headerName: i18next.t(""),
        field: "selected",
        headerCheckboxSelection: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        filter: false,
        suppressSizeToFit: true,
        width: 100,
        cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        hide: true
    },
    {
        headerName: i18next.t("Role"),
        field: "name",
        cellRenderer: "roleRender"
    },
    {
        headerName: i18next.t("Status"),
        field: "status"
    },
    {
        headerName: i18next.t("CreatedOn"),
        field: "createdAt",
        valueFormatter: ({ value }) => convertToLocalTime(value),
        sort: "desc"
    },
    {
        headerName: i18next.t("CreatedBy"),
        field: "createdBy"
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionRender",
        suppressSizeToFit: true,
        width: 120,
        filter: false
    }
];

export default RolesListColDefs;
