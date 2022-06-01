import i18next from "i18next";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

const semiColumnDefs = [
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
    }
];

const columnDefs = [
    {
        headerName: i18next.t("Project Code"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Project Name"),
        field: "projectTitle"
    },
    {
        headerName: i18next.t("Total Budget"),
        field: "overallBudget",
        cellStyle: { textAlign: "right" }
    },
    ...semiColumnDefs
];

export {
    defaultColDef,
    columnDefs
};
