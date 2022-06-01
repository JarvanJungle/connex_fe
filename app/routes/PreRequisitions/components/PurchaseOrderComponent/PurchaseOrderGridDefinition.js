import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

const columnDefs = [
    // {
    //     headerName: i18next.t("Trade Code"),
    //     field: "tradeCode"
    // },
    {
        headerName: i18next.t("Trade Name"),
        field: "tradeTitle"
    },
    {
        headerName: i18next.t("Trade Description"),
        field: "tradeDescription"
    },
    {
        headerName: i18next.t("Item Code"),
        field: "itemCode"
    },
    {
        headerName: i18next.t("Item Name"),
        field: "itemBrand"
    },
    {
        headerName: i18next.t("Supplier Name"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Total ForeCasted"),
        field: "totalForeCasted",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Total Spend"),
        field: "totalSpend",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Total Contracted Spend"),
        field: "totalContractedSpend",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Pending Approval Invoices (Contract)"),
        field: "contractPendingApprovalInvoices",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Approval Invoices (Contract)"),
        field: "contractApprovalInvoices",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Pending Billing (Contract)"),
        field: "contractPendingBilling",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Contracted Spend Balance"),
        field: "contractedSpendBalance",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Total Non-Contracted Spend"),
        field: "totalNonContractedSpend",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Pending Approval Invoices (Non-Contract)"),
        field: "nonContractPendingApprovalInvoices",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Approval Invoices (Non-Contract)"),
        field: "nonContractApprovalInvoices",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Pending Billing (Non-Contract)"),
        field: "nonContractPendingBilling",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Quantity"),
        field: "itemQuantity",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Unit Price"),
        field: "unitPrice",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom"
    },
    {
        headerName: i18next.t("Tax Percentage"),
        field: "taxPercentage",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Notes"),
        field: "notes"
    }
];

export {
    defaultColDef,
    columnDefs
};