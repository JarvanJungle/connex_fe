import i18next from "i18next";
import { formatDisplayDecimal } from "helper/utilities";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const BudgetDetailsProjectColDefs = [
    {
        headerName: i18next.t("ProjectCode"),
        field: "code"
    },
    {
        headerName: i18next.t("ProjectName"),
        field: "name"
    },
    {
        headerName: i18next.t("TotalForecasted"),
        field: "totalForecasted",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalSpend"),
        field: "totalSpend",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalContracted"),
        field: "totalContracted",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalContractedSpend"),
        field: "totalContractedSpend",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingApproveInvoicesContract"),
        field: "pendingApproveInvoicesContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ApproveInvoicesContract"),
        field: "approveInvoicesContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingBillingContract"),
        field: "pendingBillingContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ContractedSpendBalance"),
        field: "contractedSpendBalance",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalNonContractedSpend"),
        field: "totalNonContractedSpend",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingApproveInvoicesNonContract"),
        field: "pendingApproveInvoicesNonContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ApproveInvoicesNonContract"),
        field: "approveInvoicesNonContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PendingBillingNonContract"),
        field: "pendingBillingNonContract",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    }
];

export default BudgetDetailsProjectColDefs;
