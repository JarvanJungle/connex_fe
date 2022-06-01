import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";

const PPOListColDefs = [
    {
        headerName: i18next.t("PurchaseRequisitionNo"),
        field: "prNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("PrePurchaseOrderNo"),
        field: "prePoNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("Status"),
        field: "prePoStatus",
        valueGetter: (params) => {
            const value = params.data.prePoStatus;
            if (value) {
                if (value === "SAVE_AS_DRAFT"
                    || value === "SAVED_AS_DRAFT"
                ) {
                    return "PENDING SUBMISSION";
                }
                if (value === "PENDING_APPROVAL") {
                    return "PENDING PRE-PO APPROVAL";
                }
                if (value === "PENDING_CONVERT_TO_PO") {
                    return "PENDING CONVERSION TO PO";
                }
                return value.replaceAll("_", " ");
            }
            return value;
        },
        minWidth: 300
    },
    {
        headerName: i18next.t("SupplierName"),
        field: "supplierName",
        minWidth: 220
    },
    {
        headerName: i18next.t("Currency"),
        field: "currency",
        maxWidth: 120
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return formatDisplayDecimal(Number(value), 2);
            return "-";
        },
        maxWidth: 150
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        valueFormatter: ({ value }) => value.toUpperCase(),
        maxWidth: 120
    },
    {
        headerName: i18next.t("Requester"),
        field: "requestorName"
    },
    {
        headerName: i18next.t("Purchaser"),
        field: "purchaserName"
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalRouteName"
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalRouteSequence",
        minWidth: 320
    },
    {
        headerName: i18next.t("NextApprover"),
        field: "nextApprover"
    },
    {
        headerName: i18next.t("CreatedDate"),
        field: "convertedDate",
        valueFormatter: ({ value }) => convertToLocalTime(value),
        sort: "desc"
    },
    {
        headerName: i18next.t("UpdatedOn"),
        valueFormatter: ({ value }) => convertToLocalTime(value),
        field: "updatedDate"
    }
];

export default PPOListColDefs;
