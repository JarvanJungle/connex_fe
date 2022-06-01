import URL_CONFIG from "services/urlConfig";

const CompanyAdminSideBar = [
    {
        id: "manage-company-user",
        icon: "fa fa-user",
        title: "Manage Company User",
        path: URL_CONFIG.LIST_COMPANY_USERS,
        children: []
    },
    {
        id: "manage-company-addresses",
        icon: "fa fa-map-marker",
        title: "Manage Company Addresses",
        path: URL_CONFIG.LIST_ADDRESSES,
        children: []
    },
    {
        id: "manage-currency",
        icon: "fa fa-fw fa-money",
        title: "Manage Currencies",
        path: "",
        children: [
            {
                id: "currency-list",
                icon: "",
                title: "Currency List",
                path: URL_CONFIG.LIST_CURRENCIES
            }
        ]
    }
];

export default CompanyAdminSideBar;
