import i18next from "i18next";

const getExternalVendorTaggingColDefs = (disabled) => [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "actionDelete",
        width: 100,
        filter: false,
        hide: disabled
    },
    {
        headerName: i18next.t("CompanyCode"),
        field: "companyCode",
        width: 250
    },
    {
        headerName: i18next.t("CompanyName"),
        field: "companyName",
        width: 250
    },
    {
        headerName: i18next.t("CompanyRegNo"),
        field: "uen",
        width: 200
    },
    {
        headerName: i18next.t("ContactPerson"),
        field: "defaultSupplierUser.fullName",
        width: 250
    },
    {
        headerName: i18next.t("ContactNumber"),
        field: "phoneNumber",
        cellRenderer: (params) => {
            const { data } = params;
            if (data) {
                return `+${data?.defaultSupplierUser?.countryCode} ${data?.defaultSupplierUser?.workNumber}`;
            }
            return "";
        },
        width: 200
    },
    {
        headerName: i18next.t("Email"),
        field: "defaultSupplierUser.emailAddress",
        width: 240
    },
    {
        headerName: i18next.t("ConnectionStatus"),
        field: "connectionStatus",
        width: 200
    },
    {
        headerName: i18next.t("SystemStatus"),
        field: "systemStatus",
        cellRenderer: (params) => {
            const { value } = params;
            return value ? "Active" : "InActive";
        },
        width: 200
    }
];

export default getExternalVendorTaggingColDefs;
