import { convertToLocalTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import i18next from "i18next";
import GR_CONSTANTS from "../constants/constants";

const GRListColDefs = [
    {
        headerName: i18next.t("GoodsReceiptNo"),
        field: "grNumber"
    },
    {
        headerName: i18next.t("OrderProcessedNo"),
        field: "orderProcessedNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "grStatus",
        valueGetter: (params) => {
            const { grStatus } = params && params.data;
            if (grStatus === GR_CONSTANTS.SAVED_AS_DRAFT
                || grStatus === GR_CONSTANTS.SAVE_AS_DRAFT
            ) {
                return GR_CONSTANTS.PENDING_SUBMISSION
                    .replaceAll("_", " ");
            }
            if (grStatus) {
                return grStatus.replaceAll("_", " ");
            }
            return "";
        }
    },
    {
        headerName: i18next.t("GoodsReceiver"),
        field: "receiverName"
    },
    {
        headerName: i18next.t("OrderNo"),
        field: "orderNumber"
    },
    {
        headerName: i18next.t("SupplierName"),
        field: "supplierName"
    },
    {
        headerName: i18next.t("Type"),
        field: "procurementType",
        width: 120,
        valueGetter: ({ data }) => data?.procurementType?.toUpperCase()
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalRouteName"
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalRouteSequence"
    },
    {
        headerName: i18next.t("NextApprover"),
        field: "nextApprover"
    },
    {
        headerName: i18next.t("SubmissionDate"),
        field: "submittedDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value);
            return "";
        },
        sort: "desc"
    },
    {
        headerName: i18next.t("GRDeliveryDate"),
        field: "deliveryDate",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYY);
            return "";
        },
        sort: "desc"
    }
];

export default GRListColDefs;
