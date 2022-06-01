import i18next from "i18next";
import { formatDisplayDecimal, timeComparator, convertToLocalTime } from "helper/utilities";
import { PURCHASE_REQUISITION_STATUS } from "helper/constantsDefined";

const PurchaseRequisitionListColDefs = [
    {
        headerName: i18next.t("PurchaseRequisitionNo"),
        field: "prNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "prStatus",
        valueGetter: (params) => {
            const value = params.data.prStatus;
            switch (value) {
            case PURCHASE_REQUISITION_STATUS.SAVE_AS_DRAFT:
                return "PENDING SUBMISSION";
            case PURCHASE_REQUISITION_STATUS.APPROVED:
                return "PENDING CONVERSION TO PO";
            case PURCHASE_REQUISITION_STATUS.PENDING_APPROVAL:
                return "PENDING APPROVAL";
            case PURCHASE_REQUISITION_STATUS.SENT_BACK:
                return "SENT BACK";
            case PURCHASE_REQUISITION_STATUS.PARTIALLY_CONVERTED:
                return "PARTIALLY CONVERTED";
            case PURCHASE_REQUISITION_STATUS.PENDING_CONVERT_TO_PRE_PO:
                return "PENDING CONVERSION TO PO";
            case PURCHASE_REQUISITION_STATUS.CONVERTED_TO_PO:
                return "CONVERTED TO PO";
            case PURCHASE_REQUISITION_STATUS.CONVERTED_TO_PPO:
                return "CONVERTED TO PRE-PO";
            default:
                return value.replaceAll("_", " ");
            }
        },
        minWidth: 250
    },
    {
        headerName: i18next.t("Requester"),
        field: "requestorName",
        maxWidth: 160
    },
    {
        headerName: i18next.t("PurchaseRequestTitle"),
        field: "prTitle",
        minWidth: 220,
        tooltipField: "prTitle",
        tooltipComponentParams: {
            fieldTooltip: "prTitle",
            isShow: true
        }
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        width: 260
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        maxWidth: 120
    },
    {
        headerName: i18next.t("Amount"),
        field: "totalAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return formatDisplayDecimal(Number(value), 2);
            return "0.00";
        },
        maxWidth: 120
    },
    {
        headerName: i18next.t("ProcurementType"),
        field: "procurementType",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return value;
        },
        maxWidth: 160
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
        headerName: i18next.t("SubmittedOn"),
        field: "submittedDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value);
            return value;
        },
        sort: "desc"
    },
    {
        headerName: i18next.t("UpdatedOn"),
        field: "updatedDate",
        comparator: timeComparator,
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value);
            return value;
        }
    }
];

export default PurchaseRequisitionListColDefs;
