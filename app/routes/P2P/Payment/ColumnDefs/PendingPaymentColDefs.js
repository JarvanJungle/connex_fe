import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const pendingPaymentColDefs = (write) => [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        minWidth: 220,
        headerCheckboxSelection: write,
        headerCheckboxSelectionFilteredOnly: write,
        checkboxSelection: (params) => {
            if (write) {
                const { data } = params;
                return data.isSelected;
            }
            return write;
        }
    },
    {
        headerName: i18next.t("Vendor Name"),
        field: "vendorName",
        valueFormatter: (param) => (param.value ? param.value.toUpperCase() : "")
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode"
    },
    {
        headerName: i18next.t("Due Date From Submission"),
        field: "dueDateFromSubmission",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("System Due Date"),
        field: "systemDueDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Overdue (Days)"),
        field: "overdueDays",
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode"
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "paymentStatus",
        valueGetter: (params) => {
            const value = params.data.paymentStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    },
    {
        headerName: i18next.t("Payment Reference No."),
        field: "paymentReferenceNo"
    },
    {
        headerName: i18next.t("SubmissionDate"),
        field: "invoiceSubmissionDate",
        sort: "desc",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Unpaid Amount"),
        field: "fullyUnpaidAmt",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Overdue > 60 Days"),
        field: "overDueOver60Days",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Overdue < 60 Days"),
        field: "overDueLessThan60days",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Overdue < 30 Days"),
        field: "overDueLessThan30days",
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Approval Date"),
        field: "approvalDate",
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Payment Terms (Days)"),
        field: "paymentTerms"
    },
    {
        headerName: i18next.t("Approved By"),
        field: "approvedBy"
    },
    {
        headerName: i18next.t("InvoiceStatus"),
        field: "invoiceStatus",
        valueGetter: (params) => {
            const value = params.data.invoiceStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        }
    }
];

export default pendingPaymentColDefs;
