import i18next from "i18next";

const AddVendorColDefs = [
    {
        headerName: i18next.t("CompanyCode"),
        field: "companyCode",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: (params) => {
            const { data } = params;
            return !data.isSelected;
        }
    },
    {
        headerName: i18next.t("CompanyName"),
        field: "companyName"
    },
    {
        headerName: i18next.t("CompanyRegNo"),
        field: "uen"
    },
    {
        headerName: i18next.t("ContactPerson"),
        field: "defaultSupplierUser.fullName"
    },
    {
        headerName: i18next.t("ContactNumber"),
        field: "phoneNumber",
        valueFormatter: ({ data }) => `(${data?.defaultSupplierUser?.countryCode}) ${data?.defaultSupplierUser?.workNumber}`
    },
    {
        headerName: i18next.t("Email"),
        field: "defaultSupplierUser.emailAddress",
        width: 240
    },
    {
        headerName: i18next.t("ConnectionStatus"),
        field: "connectionStatus"
    },
    {
        headerName: i18next.t("SystemStatus"),
        field: "systemStatus",
        cellRenderer: (params) => {
            const { value } = params;
            return value ? "Active" : "InActive";
        }
    }
];

export default AddVendorColDefs;
