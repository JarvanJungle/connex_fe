import i18next from "i18next";
import {
    convertToLocalTime, formatDateString, formatNumberForRow
} from "helper/utilities";
import { formatStyleNumber } from "../helper/utilities";

const formatDate = (params) => formatDateString(params?.value, "DD/MM/YYYY");

export default [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        width: 160
    },
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber",
        valueFormatter: ({ value }) => value?.join(", ")
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        valueGetter: (params) => {
            const value = params.data.invoiceStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    },
    {
        headerName: i18next.t("InvoiceType"),
        field: "invoiceType",
        valueGetter: (params) => {
            const value = params.data.invoiceType;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 140
    },
    {
        headerName: i18next.t("Issuer"),
        field: "issuer",
        width: 160
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 120
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        valueFormatter: formatNumberForRow,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        valueFormatter: formatNumberForRow,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "paymentStatus",
        valueGetter: (params) => {
            const value = params.data.paymentStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 140
    },
    {
        headerName: i18next.t("ApprovalRoute"),
        field: "approvalRouteName",
        width: 140
    },
    {
        headerName: i18next.t("ApprovalSequence"),
        field: "approvalRouteSequence",
        width: 240
    },
    {
        headerName: i18next.t("NextApprover"),
        field: "nextApprover",
        width: 180
    },
    {
        headerName: i18next.t("SubmittedBy"),
        field: "submittedBy",
        width: 140
    },
    {
        headerName: i18next.t("Project"),
        valueFormatter: (params) => (params?.data?.projectCode ? params?.data?.projectCode : ""),
        width: 140
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        valueFormatter: (params) => convertToLocalTime(params?.value),
        sort: "desc"
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        valueFormatter: formatDate,
        width: 140
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        valueFormatter: formatDate,
        width: 140
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        valueFormatter: (params) => convertToLocalTime(params?.value)
    }
];
