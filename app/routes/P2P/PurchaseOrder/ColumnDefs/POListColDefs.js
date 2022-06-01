import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";

const POListColDefs = [
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber",
        minWidth: 220,
        valueFormatter: (param) => (param?.value === "Manual" ? "" : param?.value)
    },
    {
        headerName: i18next.t("PurchaseRequisitionNo"),
        field: "prNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("RFQNo"),
        field: "rfqNumber",
        minWidth: 220
    },
    {
        headerName: i18next.t("PrePurchaseOrderNo"),
        field: "ppoNumber",
        minWidth: 220,
        hide: true
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueFormatter: (params) => {
            const { status } = params?.data;
            switch (status) {
            case "PENDING_REVIEW":
                return "PENDING ISSUE";
            default:
                return status?.replaceAll("_", " ") ?? "";
            }
        },
        valueGetter: (params) => {
            const { status } = params?.data;
            switch (status) {
            case "PENDING_REVIEW":
                return "PENDING ISSUE";
            default:
                return status?.replaceAll("_", " ") ?? "";
            }
        }
    },
    {
        headerName: i18next.t("SupplierAck"),
        field: "supplierAck",
        valueFormatter: (params) => params.data.supplierAck?.replaceAll("_", " ") ?? "",
        valueGetter: (params) => params.data.supplierAck?.replaceAll("_", " ") ?? "",
        minWidth: 220
    },
    {
        headerName: i18next.t("Requester"),
        field: "purchaserName"
    },
    {
        headerName: i18next.t("SupplierName"),
        field: "supplierName",
        minWidth: 220
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        width: 140
    },
    {
        headerName: i18next.t("Currency"),
        field: "sourceCurrencyCode",
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
        maxWidth: 120,
        valueFormatter: (params) => params?.value?.toUpperCase()
    },
    {
        headerName: i18next.t("Purchaser"),
        field: "requesterName"
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalCode"
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalSequence",
        minWidth: 320
    },
    {
        headerName: i18next.t("NextApprover"),
        field: "nextGroup"
    },
    {
        headerName: i18next.t("CreatedDate"),
        field: "submittedOn",
        valueFormatter: (params) => convertToLocalTime(params?.value),
        sort: "desc"
    },
    {
        headerName: i18next.t("IssuedDate"),
        field: "issuedDate",
        valueFormatter: (params) => convertToLocalTime(params?.value)
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedOn",
        valueFormatter: (params) => convertToLocalTime(params?.value)
    }
];

export default POListColDefs;
