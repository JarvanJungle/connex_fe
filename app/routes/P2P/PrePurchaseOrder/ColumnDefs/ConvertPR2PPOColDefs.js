import i18next from "i18next";

const ConvertPR2PPOColDefs = [
    {
        headerName: i18next.t("Supplier"),
        field: "supplier",
        cellRenderer: (params) => {
            const { data } = params;
            if (data) return data.companyName;
            return data;
        }
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

export default ConvertPR2PPOColDefs;
