import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import i18next from "i18next";

const editableLogic = (params) => (
    (params.data.isEdit));

const formatNumber = (params, number = 2) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), number);
    if (value === 0) return "0.00";
    return "";
};

const PaymentInvoiceColDefs = [
    {
        headerName: i18next.t("Action"),
        field: "action",
        cellRenderer: "viewRenderer",
        filter: false,
        width: 100,
        hide: false,
        suppressSizeToFit: false
    },
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRenderer"
    },
    {
        headerName: i18next.t("VendorName"),
        field: "vendorName",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("SubTotal"),
        field: "subTotal",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Tax Amount"),
        field: "tax",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Total Amount (Incl. Tax)"),
        field: "totalAmount",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Paid Amount (Incl. Tax)"),
        field: "paidAmount",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Processing Payment Amount (Incl. Tax)"),
        field: "processPaymentAmt",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Outstanding Amount (Incl. Tax)"),
        field: "pendingPaymentAmount",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params, 3)
    },
    {
        headerName: i18next.t("Amount to Pay (Incl. Tax)"),
        field: "amountToPay",
        editable: editableLogic,
        suppressSizeToFit: true,
        cellStyle: (params) => {
            if (location.pathname.includes('payment-create') || params.data.status === 'SENT_BACK') {
                if (Number(params.data.amountToPay) !== Number(params.data.pendingPaymentAmount)) {
                    return {
                        backgroundColor: "#FCC6C6",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
                if (Number(params.data.amountToPay) === Number(params.data.pendingPaymentAmount)) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
            }
            if (location.pathname.includes('payment-details') && params.data.status !== 'SENT_BACK') {
                if (Number(params.data.pendingPaymentAmount) === 0) {
                    return {
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
                else {
                    return {
                        backgroundColor: "#FCC6C6",
                        border: "1px solid #E4E7EB",
                        textAlign: "right"
                    };
                }
            }
            if (params.data.isEdit) {
                return {
                    backgroundColor: "#DDEBF7",
                    border: "1px solid #E4E7EB",
                    textAlign: "right"
                };
            } return { textAlign: "right" };
        },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Pay All"),
        headerComponent: "customHeader",
        field: "completedPay",
        cellRenderer: "completedPay",
        headerComponentParams: {
            enableCustomButton: true,
            headerValue: false
        },
        filter: false,
        width: 160,
        cellStyle: (params) => {
            if (params.data.isEdit) {
                return {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: "20px"
                };
            } return {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: "20px",
                disabled: true
            };
        },
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Submission Date"),
        field: "invoiceSubmissionDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    },
    {
        headerName: i18next.t("Invoice Date"),
        field: "invoiceDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Payment Terms (Days)"),
        field: "paymentTerms",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Due Date from Submission"),
        field: "dueDateFromSubmission",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Invoice Due Date"),
        field: "invoiceDueDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("System Due Date"),
        field: "systemDueDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Overdue (Days)"),
        field: "overdueDays",
        cellStyle: { textAlign: "right" },
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Payment Status"),
        field: "paymentStatus",
        suppressSizeToFit: true,
        valueFormatter: (param) => (param.value ? param.value.replaceAll("_", " ") : "")
    },
    {
        headerName: i18next.t("Payment No."),
        field: "paymentNumber",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRendererPayment"
    },
    {
        headerName: i18next.t("Overdue >= 60 Days"),
        field: "overDueOver60Days",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Overdue < 60 Days"),
        field: "overDueLessThan60days",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Overdue < 30 Days"),
        field: "overDueLessThan30days",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    }
];

export default PaymentInvoiceColDefs;
