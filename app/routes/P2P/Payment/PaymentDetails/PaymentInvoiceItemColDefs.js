import CUSTOM_CONSTANTS from "helper/constantsDefined";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import i18next from "i18next";

const formatNumber = (params) => {
    const { value } = params;
    const { currencyCode } = params.data;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const PaymentInvoiceItemColDefs = [
    {
        headerName: i18next.t(""),
        field: "selectInvoice",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            disabled: true
        },
        checkboxSelection: (params) => {
            const { data } = params;
            return !data.isSelected;
        },
        filter: false,
        width: 65
    },
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRenderer"
    },
    {
        headerName: i18next.t("Vendor"),
        field: "vendorName",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        suppressSizeToFit: true,
        width: 150
    },
    {
        headerName: i18next.t("Total Amount"),
        field: "totalAmount",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Amount To Pay"),
        field: "amountToPay",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Invoice Date"),
        field: "invoiceDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY),
        sort: "desc"
    },
    {
        headerName: i18next.t("Invoice Due Date"),
        field: "invoiceDueDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYY)
    },
    {
        headerName: i18next.t("Payment Terms (Days)"),
        field: "paymentTerms",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        suppressSizeToFit: true
    }
];

export default PaymentInvoiceItemColDefs;
