import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { PAYMENT_FE_STATUS, PAYMENT_STATUS } from "../helper";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const PaymentListColDefs = [
    {
        headerName: i18next.t("Payment No"),
        field: "paymentNumber",
        minWidth: 220,
        pinned: "left"
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueGetter: (params) => {
            switch (params.data.status) {
            case PAYMENT_STATUS.PENDING_APPROVAL:
            {
                return PAYMENT_FE_STATUS.PENDING_APPROVAL;
            }
            case PAYMENT_STATUS.SAVED_AS_DRAFT:
            {
                return PAYMENT_FE_STATUS.SAVED_AS_DRAFT;
            }
            case PAYMENT_STATUS.APPROVED:
            {
                return PAYMENT_FE_STATUS.APPROVED;
            }
            case PAYMENT_STATUS.PAID:
            {
                return PAYMENT_FE_STATUS.PAID;
            }
            case PAYMENT_STATUS.SENT_BACK:
            {
                return PAYMENT_FE_STATUS.SENT_BACK;
            }
            default: return (params.data.status ? params.data.status.replaceAll("_", " ") : "");
            }
        }
    },
    {
        headerName: i18next.t("Payment Release Date"),
        field: "paymentReleaseDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Beneficiary"),
        field: "beneficiary",
        valueFormatter: (param) => (`${param.value?.supplierCode} (${param.value?.companyName})`)
    },
    {
        headerName: i18next.t("Project"),
        field: "invoices",
        valueFormatter: ({ data }) => data?.invoices
            ?.map((e) => e?.projectCode)
            ?.filter((e) => !!e)
            ?.join(", ")
            ?? ""
    },
    {
        headerName: i18next.t("Total Amount To Pay (Incl. Tax)"),
        field: "paymentAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Earliest System Due Date"),
        field: "earliestSystemDueDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Payment Reference No."),
        field: "refNumber"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("Approval Route"),
        field: "approvalName"
    },
    {
        headerName: i18next.t("Approval Sequence"),
        field: "approvalSequence"
    },
    {
        headerName: i18next.t("Next Approver"),
        field: "nextGroup"
    },
    {
        headerName: i18next.t("Created By"),
        field: "createdByName"
    },
    {
        headerName: i18next.t("Creation Date"),
        field: "paymentCreationDate",
        sort: "desc",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    }
];

export default PaymentListColDefs;
