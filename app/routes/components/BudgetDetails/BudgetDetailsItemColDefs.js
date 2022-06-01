import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatCurrency = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const BudgetDetailsItemColDefs = [
    {
        headerName: i18next.t("ItemCode"),
        field: "code"
    },
    {
        headerName: i18next.t("ItemName"),
        field: "name"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currency",
        width: 120
    },
    {
        headerName: i18next.t("TotalForecasted"),
        field: "totalForecasted",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalSpend"),
        field: "totalSpend",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalContracted"),
        field: "totalContracted",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalContractedSpend"),
        field: "totalContractedSpend",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingApproveInvoicesContract"),
        field: "pendingApproveInvoicesContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ApproveInvoicesContract"),
        field: "approveInvoicesContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingBillingContract"),
        field: "pendingBillingContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ContractedSpendBalance"),
        field: "contractedSpendBalance",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalNonContractedSpend"),
        field: "totalNonContractedSpend",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingApproveInvoicesNonContract"),
        field: "pendingApproveInvoicesNonContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ApproveInvoicesNonContract"),
        field: "approveInvoicesNonContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingBillingNonContract"),
        field: "pendingBillingNonContract",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Quantity"),
        field: "quantity",
        cellRenderer: formatNumber,
        width: 150,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("UnitPrice"),
        field: "unitPrice",
        cellRenderer: formatCurrency,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("UOM"),
        field: "uom",
        width: 150,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ExchangeRate"),
        field: "exchangeRate",
        cellRenderer: formatCurrency,
        width: 150,
        cellStyle: { textAlign: "right" }
    }
];

export default BudgetDetailsItemColDefs;
