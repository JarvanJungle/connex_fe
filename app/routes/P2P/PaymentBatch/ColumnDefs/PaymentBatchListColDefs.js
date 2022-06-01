import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { PAYMENT_BATCH_CONSTANTS } from "../helper";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const formatPaymentMethod = (params) => {
    const value = params.data.paymentMethod;
    if (value) {
        switch (value) {
        case PAYMENT_BATCH_CONSTANTS.MANUAL:
            return PAYMENT_BATCH_CONSTANTS.MANUAL_BANK_TRANSFER;
        case PAYMENT_BATCH_CONSTANTS.BANK_INTEGRATION:
            return PAYMENT_BATCH_CONSTANTS.INTEGRATED_BANK_TRANSFER;
        default:
            return value;
        }
    }

    return "";
};

const PaymentBatchListColDefs = [
    {
        headerName: i18next.t("PaymentBatchNo"),
        field: "number",
        minWidth: 220
    },
    {
        headerName: i18next.t("PaymentBatchReferenceNo"),
        field: "referenceNumber",
        tooltipField: "referenceNumber",
        tooltipComponentParams: {
            fieldTooltip: "referenceNumber",
            isShow: true
        }
    },
    {
        headerName: i18next.t("TransferStatus"),
        field: "transferStatus",
        valueGetter: (params) => {
            const value = params.data.transferStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "status",
        valueGetter: (params) => {
            const value = params.data.status;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    },
    {
        headerName: i18next.t("Payment Release Date"),
        field: "releaseDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Currency"),
        field: "currency"
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params, params?.data?.currencyCode)
    },
    {
        headerName: i18next.t("PaymentMethod"),
        field: "paymentMethod",
        valueGetter: formatPaymentMethod
    },
    {
        headerName: i18next.t("Bank"),
        field: "bankAccount",
        valueFormatter: (params) => {
            const { sourceBankAccount } = params && params.data;
            if (sourceBankAccount) {
                return sourceBankAccount.bankName || "";
            }
            return "";
        }
    },
    {
        headerName: i18next.t("BankAccount"),
        field: "sourceBankAccount",
        valueGetter: (params) => {
            const value = params.data.sourceBankAccount;
            return value?.bankAccountNo ? value?.bankAccountNo : "";
        }
    },
    {
        headerName: i18next.t("PaymentFileName"),
        field: "paymentFileName",
        tooltipField: "paymentFileName",
        tooltipComponentParams: {
            fieldTooltip: "paymentFileName",
            isShow: true
        }
    },
    {
        headerName: i18next.t("CreatedBy"),
        field: "createdBy"
    },
    {
        headerName: i18next.t("CreatedOn"),
        field: "createdAt",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss),
        sort: "desc"
    }
];

export default PaymentBatchListColDefs;
