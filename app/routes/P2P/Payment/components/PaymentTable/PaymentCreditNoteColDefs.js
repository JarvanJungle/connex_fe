import i18next from "i18next";
import { convertToLocalTime, formatDisplayDecimal } from "helper/utilities";
import CUSTOM_CONSTANTS from "helper/constantsDefined";

const formatNumber = (params) => {
    const { value } = params;
    if (value) return formatDisplayDecimal(Number(value), 2);
    if (value === 0) return "0.00";
    return "";
};

const PaymentCreditNoteColDefs = [
    {
        headerName: i18next.t("Apply"),
        field: "apply",
        cellRenderer: "apply",
        width: 100,
        cellStyle: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: "20px"
        },
        filter: false,
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Credit Note"),
        field: "creditNoteNumber",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRenderer"
    },
    {
        headerName: i18next.t("VendorName"),
        field: "vendorName",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber",
        suppressSizeToFit: true,
        cellRenderer: "LinkCellRendererInvoice"
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        suppressSizeToFit: true
    },
    {
        headerName: i18next.t("Sub Total"),
        field: "subTotal",
        suppressSizeToFit: true,
        cellStyle: { textAlign: "right" },
        cellRenderer: (params) => formatNumber(params)
    },
    {
        headerName: i18next.t("Tax Amount"),
        field: "taxAmount",
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
        headerName: i18next.t("Issue Date"),
        field: "submissionDate",
        suppressSizeToFit: true,
        valueFormatter: (param) => convertToLocalTime(param.value, CUSTOM_CONSTANTS.DDMMYYYHHmmss)
    }
];

export default PaymentCreditNoteColDefs;
