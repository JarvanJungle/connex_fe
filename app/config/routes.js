import CONFIG from '../config'

const APP_ROUTES = () => {

    let roleCheck = JSON.parse(localStorage.getItem("companyRole"))

    let companyAdminSideBar = []
    if (roleCheck !== null && roleCheck.role.length !== 0){
        for (let i = 0; i < roleCheck.role.length; i++){
            if (roleCheck.role[i] === "COMPANY_ADMIN"){
                companyAdminSideBar = [
                    {
                        id: 2,
                        icon: "fa fa-user",
                        title: "Manage Company User",
                        path: CONFIG.LIST_COMPANY_USERS,
                        children: []
                    },
                    {
                        id: 4,
                        icon: "fa fa-map-marker",
                        title: "Manage Address",
                        path: CONFIG.LIST_ADDRESSES,
                        children: []
                    },
                    {
                        id: 5,
                        icon: "fa fa-fw fa-money",
                        title: "Manage Currencies",
                        path: CONFIG.LIST_CURRENCIES
                    }
                ]
            }
        }
    }

    return(
    {
        entity: [
            {
                id: 1,
                icon: "fa fa-fw fa-plus-square",
                title: "Onboard Entity",
                path: CONFIG.CREATE_ENTITY,
                children: []
            },
            {
                id: 2,
                icon: "fa fa-fw fa-list",
                title: "List of Entities",
                path: CONFIG.LIST_ENTITIES,
                children: []
            },

        ],
        bank: [
            {
                id: 1,
                icon: "fa fa-fw fa-plus-square",
                title: "Create Bank Connection",
                path: "/bank/create",
                children: []
            },
            {
                id: 2,
                icon: "fa fa-fw fa-list",
                title: "Banks",
                path: "/bank/list",
                children: []
            }
        ],
        ENTITY_ADMIN: [
            {
                id: 1,
                icon: "fa fa-users",
                title: "Manage Organization Users",
                path: CONFIG.LIST_ORGANIZATION_USERS,
                children: []
            },
            {
                id: 2,
                icon: "fa fa-user",
                title: "Manage Company User",
                path: CONFIG.LIST_COMPANY_USERS,
                children: []
            },
            {
                id: 3,
                icon: "fa fa-fw fa-list",
                title: "Manage Sub-Entities",
                path: "",
                children: [
                    {
                        id: 1,
                        icon: "",
                        title: "Create Company",
                        path: CONFIG.CREATE_COMPANY
                    },
                    {
                        id: 2,
                        icon: "",
                        title: "List of Companies",
                        path: CONFIG.LIST_COMPANIES
                    }
                ]
            },
            {
                id: 4,
                icon: "fa fa-map-marker",
                title: "Manage Address",
                path: CONFIG.LIST_ADDRESSES,
                children: []
            },
            {
                id: 5,
                icon: "fa fa-fw fa-money",
                title: "Manage Currencies",
                path: CONFIG.LIST_CURRENCIES
            },
            {
                id: 6,
                icon: "fa fa-fw fa-list",
                title: "Manage Connection",
                path: CONFIG.LIST_CONNECTION,
                children: []
            },
            {
                id: 7,
                icon: "fa fa-fw fa-list",
                title: "Manage UOM",
                path: CONFIG.LIST_UOM,
                children: []
            },
            {
                id: 8,
                icon: "fa fa-fw fa-list",
                title: "Manage G/L",
                path: CONFIG.LIST_GL,
                children: []
            },
            {
                id: 9,
                icon: "fa fa-fw fa-list",
                title: "Manage Tax Records",
                path: CONFIG.LIST_TAX_RECORDS,
                children: []
            },
            {
                id: 10,
                icon: "fa fa-fw fa-list",
                title: "Manage Catalogue",
                path: CONFIG.LIST_CATALOGUES,
                children: []
            },
            {
                id: 11,
                icon: "fa fa-fw fa-list",
                title: "Manage Trade Code",
                path: CONFIG.LIST_MANAGE_PROJECT_TRADE,
                children: []
            },
            {
                id: 12,
                icon: "fa fa-fw fa-list",
                title: "Manage Admin Matrix",
                path: CONFIG.MANAGE_ADMIN_MATRIX,
                children: []
            },
        ],
        COMPANY_ADMIN: companyAdminSideBar
    })
}

// Object.freeze(APP_ROUTES);

export default APP_ROUTES;
