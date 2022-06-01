import i18next from "i18next";
import { formatDisplayDecimal, convertToLocalTime } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    return "0.00";
};

const dateTimeFormatter = (params) => {
    const { value } = params;
    if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYHHmmss);
    return value;
};

const dateFormatter = (params) => {
    const { value } = params;
    if (value) return convertToLocalTime(value, CUSTOM_CONSTANTS.DDMMYYYY);
    return value;
};

const PaymentsItemColDefs = [
    {
        headerName: i18next.t("PaymentNo"),
        field: "paymentNo",
        cellRenderer: "paymentNoRenderer"
    },
    {
        headerName: i18next.t("DocumentNo"),
        field: "invoiceNo",
        cellRenderer: "invoiceNoRenderer"
    },
    {
        headerName: i18next.t("VendorName"),
        field: "vendorName"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currency",
        width: 140
    },
    {
        headerName: i18next.t("SubTotal"),
        field: "subTotal",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TaxAmount"),
        field: "tax",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("TotalAmountInclTax"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("PaidAmountInclTax"),
        field: "paidAmount",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("ProcessingPaymentAmountInclTax"),
        field: "processPaymentAmt",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("AmountToPayInclTax"),
        field: "amountToPay",
        cellRenderer: formatNumber,
        cellStyle: {
            textAlign: "right",
            backgroundColor: "rgba(174, 197, 125, 0.3)"
        }
    },
    {
        headerName: i18next.t("OutstandingAmountInclTax"),
        field: "outstandingAmount",
        cellRenderer: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("BankName"),
        field: "bankName"
    },
    {
        headerName: i18next.t("BankAccountNo"),
        field: "bankAccountNo"
    },
    {
        headerName: i18next.t("BankAccountHolderName"),
        field: "accountHolderName"
    },
    {
        headerName: i18next.t("BankAccountBranch"),
        field: "branch"
    },
    {
        headerName: i18next.t("SubmissionDate"),
        field: "invoiceSubmissionDate",
        valueFormatter: dateTimeFormatter
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        valueFormatter: dateFormatter
    },
    {
        headerName: i18next.t("PaymentTermsDays"),
        field: "paymentTerms",
        width: 140
    },
    {
        headerName: i18next.t("DueDateFromSubmission"),
        field: "dueDateFromSubmission",
        valueFormatter: dateTimeFormatter
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        valueFormatter: dateFormatter
    },
    {
        headerName: i18next.t("SystemDueDate"),
        field: "systemDueDate",
        valueFormatter: dateTimeFormatter
    },
    {
        headerName: i18next.t("OverdueDays"),
        field: "overdueDays",
        cellStyle: { textAlign: "right" },
        width: 140
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "paymentStatus",
        valueFormatter: (params) => (params.value.replaceAll("_", " ")),
        width: 140
    },
    {
        headerName: i18next.t("PaymentNumber"),
        field: "paymentNumber",
        cellRenderer: "PaymentNumberRenderer",
    },
    {
        headerName: i18next.t("Overdue>=60Days"),
        field: "overDueOver60Days",
        valueFormatter: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Overdue<60Days"),
        field: "overDueLessThan60days",
        valueFormatter: formatNumber,
        cellStyle: { textAlign: "right" }
    },
    {
        headerName: i18next.t("Overdue<30Days"),
        field: "overDueLessThan30days",
        valueFormatter: formatNumber,
        cellStyle: { textAlign: "right" }
    }
];

export default PaymentsItemColDefs;
