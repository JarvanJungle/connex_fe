import i18next from "i18next";

const ConvertToPOColDefs = [
    {
        headerName: i18next.t("Supplier"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionConvert",
        cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "2px"
        },
        floatingFilterComponentParams: { suppressFilterButton: true },
        filterParams: { filterOptions: ["inRange"] }
    }
];

export default ConvertToPOColDefs;
