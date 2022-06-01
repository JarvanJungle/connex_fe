import i18next from "i18next";
import {
    formatNumber, formatDate,
    formatStyleNumber, formatDateTime
} from "../helper/utilities";

const CNListBuyerColDefs = [
    {
        headerName: i18next.t("CreditNoteNo"),
        field: "creditNoteNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueGetter: (params) => {
            const value = params.data.status;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("CreditAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("ProjectCode"),
        field: "projectCode",
        
        width: 140
    },
    {
        headerName: i18next.t("Applied in Payment?"),
        field: "appliedPayment",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return "Yes";
            return "No";
        },
        width: 180
    },
    {
        headerName: i18next.t("SubmissionDate"),
        field: "submissionDate",
        cellRenderer: formatDateTime,
        width: 210,
        sort: "desc"
    },
    {
        headerName: i18next.t("CreditNoteDate"),
        field: "creditNoteDate",
        cellRenderer: formatDate,
        width: 180
    },
    {
        headerName: i18next.t("VendorNameSupplier"),
        field: "vendorName",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return value;
        }
    },
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber"
    },
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber"
    },
    {
        headerName: i18next.t("Type"),
        field: "type",
        valueGetter: (params) => {
            const value = params.data.type;
            if (value) return value.replaceAll("_", " ");
            return value;
        },
        width: 250
    },
    {
        headerName: i18next.t("Submitted By"),
        field: "requesterName",
       
        width: 250
    },
    {
        headerName: i18next.t("Approval Route"),
        field: "approvalRouteName",
       
        width: 250
    },
    {
        headerName: i18next.t("Approval Sequence"),
        field: "approvalRouteSequence",
       
        width: 250
    },
    {
        headerName: i18next.t("Next Approver"),
        field: "nextApprover",
       
        width: 250
    },
    {
        headerName: i18next.t("Credit Note Approval Date"),
        field: "cnApprovalDate",
        cellRenderer: formatDateTime,
        width: 250
    }
];

const CNListSupplierColDefs = [
    {
        headerName: i18next.t("CreditNoteNo"),
        field: "creditNoteNumber"
    },
    {
        headerName: i18next.t("Status"),
        field: "status",
        valueGetter: (params) => {
            const value = params.data.status;
            if (value) return value.replaceAll("_", " ");
            return "";
        },
        width: 180
    },
    {
        headerName: i18next.t("CreditAmount"),
        field: "totalAmount",
        cellRenderer: formatNumber,
        cellStyle: formatStyleNumber,
        width: 140
    },
    {
        headerName: i18next.t("SubmissionDate"),
        field: "submissionDate",
        cellRenderer: formatDateTime,
        width: 210,
        sort: "desc"
    },
    {
        headerName: i18next.t("CreditNoteDate"),
        field: "creditNoteDate",
        cellRenderer: formatDate,
        width: 180
    },
    {
        headerName: i18next.t("VendorNameBuyer"),
        field: "vendorName",
        cellRenderer: (params) => {
            const { value } = params;
            if (value) return value.toUpperCase();
            return value;
        }
    },
    {
        headerName: i18next.t("InvoiceNo"),
        field: "invoiceNumber"
    },
    {
        headerName: i18next.t("PurchaseOrderNo"),
        field: "poNumber"
    }
];

function getCNListColDefs(isBuyer) {
    return isBuyer ? CNListBuyerColDefs : CNListSupplierColDefs;
}

export default getCNListColDefs;
