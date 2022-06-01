import i18next from "i18next";

import {
    formatNumber,
    formatDate,
    formatStyleNumber,
    formatDateTime
} from "../helper/utilities";

const InvoiceListBuyerColDefs = [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        width: 140
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        valueGetter: (params) => {
            const value = params.data.invoiceStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        width: 180
    },
    {
        headerName: i18next.t("Matching"),
        field: "matching",
        valueGetter: (params) => {
            const value = params.data.matching;
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
        width: 110
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
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
        headerName: i18next.t("SubmittedBy"),
        field: "submittedBy",
        width: 140
    },
    {
        headerName: i18next.t("InvoiceType"),
        field: "invoiceType",
        valueGetter: (params) => {
            const value = params.data.invoiceType;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 160
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        cellRenderer: formatDateTime,
        sort: "desc"
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        cellRenderer: formatDateTime,
        width: 180
    }
];

const InvoiceListSupplierColDefs = [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNo",
        width: 140
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        valueGetter: (params) => {
            const value = params.data.invoiceStatus;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
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
        headerName: i18next.t("Recipient"),
        field: "recipient",
        width: 160
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 110
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("Project"),
        field: "projectCode",
        width: 180
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        cellRenderer: formatDateTime,
        sort: "desc"
    },
    {
        headerName: i18next.t("PaymentTerms"),
        field: "paymentTerms",
        width: 140
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        cellRenderer: formatDateTime,
        width: 180
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("SubmittedBy"),
        field: "submittedBy",
        width: 160
    },
    {
        headerName: i18next.t("SubmittedStaff"),
        field: "submittedStaff",
        width: 140
    }
];
const opcInvoiceListSupplierColDefs = [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber",
        width: 140
    },
    {
        headerName: i18next.t("Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        width: 140,
        cellRenderer: (params) => {
            const { value = "" } = params;
            const array = value.split("-");
            return `${array[1]} - ${array[0]}`;
        }
    },
    {
        headerName: i18next.t("WorkOrderTitle"),
        field: "workOrderTitle",
        width: 140
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "paymentStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 140
    },
    {
        headerName: i18next.t("Recipient"),
        field: "recipient",
        width: 160
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 110
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        cellRenderer: formatDateTime,
        sort: "desc"
    },
    {
        headerName: i18next.t("PaymentTerms"),
        field: "paymentTerm",
        width: 140
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        cellRenderer: formatDateTime,
        width: 180
    },
    {
        headerName: i18next.t("InvoiceDate"),
        field: "invoiceDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("SubmittedBy"),
        field: "submittedBy",
        width: 160
    },
    {
        headerName: i18next.t("SubmittedStaff"),
        field: "submittedStaff",
        width: 140
    }
];
const opcInvoiceListBuyerColDefs = [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber",
        width: 140
    },
    {
        headerName: i18next.t("Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        width: 140,
        cellRenderer: (params) => {
            const { value = "" } = params;
            const array = value.split("-");
            return `${array[1]} - ${array[0]}`;
        }
    },
    {
        headerName: i18next.t("Work Order Title"),
        field: "woTitle",
        width: 140
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("Issuer"),
        field: "issuer",
        width: 180
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 110
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("ProjectStatus"),
        field: "projectStatus",
        width: 180
    },
    {
        headerName: i18next.t("PaymentStatus"),
        field: "paymentStatus",
        width: 180
    },
    {
        headerName: i18next.t("Submitted By"),
        field: "submittedBy",
        width: 180
    },
    {
        headerName: i18next.t("Invoice Type"),
        field: "invoiceType",
        width: 180
    },
    {
        headerName: i18next.t("Project Title"),
        field: "projectTitle",
        width: 180
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        cellRenderer: formatDateTime,
        sort: "desc"
    },
    {
        headerName: i18next.t("Invoice Date"),
        field: "invoiceDate",
        width: 140
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        cellRenderer: formatDateTime,
        width: 180
    }

];

export const opcPendingInvoiceListBuyerColDefs = [
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber",
        width: 140
    },
    {
        headerName: i18next.t("Claim Reference Month"),
        field: "paymentClaimReferenceMonth",
        width: 140
    },
    {
        headerName: i18next.t("Work Order Title"),
        field: "woTitle",
        width: 140
    },
    {
        headerName: i18next.t("Status"),
        field: "invoiceStatus",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("Issuer"),
        field: "issuer",
        width: 180
    },
    {
        headerName: i18next.t("Currency"),
        field: "currencyCode",
        width: 110
    },
    {
        headerName: i18next.t("TotalAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("PaidAmount"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("Payment Status"),
        field: "paidAmount",
        cellRenderer: (params) => formatNumber(params, "_"),
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("ProjectStatus"),
        field: "projectStatus",
        width: 180
    },
    {
        headerName: i18next.t("Approval Route"),
        field: "approvalRoute",
        width: 180
    },
    {
        headerName: i18next.t("Approval Sequence"),
        field: "approvalSequence",
        width: 180
    },
    {
        headerName: i18next.t("Next Approver"),
        field: "nextApprover",
        width: 180
    },
    {
        headerName: i18next.t("Submitted By"),
        field: "submittedBy",
        width: 180
    },
    {
        headerName: i18next.t("Invoice Type"),
        field: "invoiceType",
        width: 180
    },
    {
        headerName: i18next.t("Project Title"),
        field: "projectTitle",
        width: 180
    },
    {
        headerName: i18next.t("InvoiceSubmissionDate"),
        field: "invoiceSubmissionDate",
        cellRenderer: formatDateTime,
        sort: "desc"
    },
    {
        headerName: i18next.t("Invoice Date"),
        field: "invoiceDate",
        width: 140
    },
    {
        headerName: i18next.t("InvoiceDueDate"),
        field: "invoiceDueDate",
        cellRenderer: formatDate,
        width: 160
    },
    {
        headerName: i18next.t("InvoiceApprovalDate"),
        field: "invoiceApprovalDate",
        cellRenderer: formatDateTime,
        width: 180
    }

];

function getInvoiceListColDefs(isBuyer) {
    return isBuyer ? InvoiceListBuyerColDefs : InvoiceListSupplierColDefs;
}
export function getOpcInvoiceListColDefs(isBuyer) {
    return isBuyer ? opcInvoiceListBuyerColDefs : opcInvoiceListSupplierColDefs;
}

export default getInvoiceListColDefs;
