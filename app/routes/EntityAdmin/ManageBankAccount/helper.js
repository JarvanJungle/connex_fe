import { convertToLocalTime } from "helper/utilities";

export const PAGE_STAGE = {
    DETAIL: "DETAIL",
    CREATE: "CREATE",
    EDIT: "EDIT",
    APPROVE: "APPROVE",
    REJECT: "REJECT",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
};
export const BANK_ACCOUNT_STATUS = {
    CREATE: "CREATE",
    PENDING_APPROVAL: "PENDING APPROVAL",
    APPROVED: "APPROVED"
};
export const BANK_ACCOUNT_STATUS_FE = {
    CREATE: "CREATE",
    PENDING_APPROVAL: "PENDING APPROVAL",
    APPROVED: "APPROVED"
};

export const bankAccountColumnDefs = (t) => ([
    {
        headerName: t("Bank Label"),
        field: "bankLabel",
        suppressSizeToFit: true
    },
    {
        headerName: t("Status"),
        field: "status",
        suppressSizeToFit: true,
        width: 200,
        valueFormatter: (params) => {
            switch (params.value) {
            case BANK_ACCOUNT_STATUS.APPROVED:
            {
                return BANK_ACCOUNT_STATUS_FE.APPROVED;
            }
            case BANK_ACCOUNT_STATUS.PENDING_APPROVAL:
            {
                return BANK_ACCOUNT_STATUS_FE.PENDING_APPROVAL;
            }
            default: return params.value;
            }
        }
    },
    {
        headerName: t("Bank Name"),
        field: "bankName",
        suppressSizeToFit: true,
        width: 200
    },
    {
        headerName: t("Bank Account No."),
        field: "bankAccountNo",
        suppressSizeToFit: true,
        width: 200
    },
    {
        headerName: t("Account Holder Name"),
        field: "accountHolderName",
        suppressSizeToFit: true,
        width: 200
    },
    {
        headerName: t("Currency"),
        field: "currency",
        suppressSizeToFit: true,
        width: 120
    },
    {
        headerName: t("Integration Products"),
        field: "integrationProducts",
        suppressSizeToFit: true,
        width: 150
    },
    {
        headerName: t("Requested By"),
        field: "requestorName",
        suppressSizeToFit: true,
        width: 150
    },
    {
        headerName: t("Approved By"),
        field: "approverName",
        suppressSizeToFit: true,
        width: 150
    },
    {
        headerName: t("Updated On"),
        field: "updatedOn",
        suppressSizeToFit: true,
        width: 200,
        valueFormatter: (param) => convertToLocalTime(param.value),
        sort: "desc"
    }
]);

export const initialValues = {
    bankLabel: "",
    country: "",
    bankName: "",
    bankAccountNo: "",
    accountHolderName: "",
    currency: "",
    swiftCode: "",
    branch: "",
    branchCode: "",
    branchCity: "",
    branchAddressLine1: "",
    branchAddressLine2: "",
    postalCode: "",
    state: ""
};

export const DraftProgressClaimListColumnDefs = (t) => ([
    {
        headerName: t("Draft Progress Claim No."),
        field: "draftProgressClaimNo",
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true
    },
    {
        headerName: t("Developer Name"),
        field: "developerName"
    },
    {
        headerName: t("Status"),
        field: "status"
    },
    {
        headerName: t("Payment Claim Reference Month"),
        field: "paymentClaimReferenceMonth"
    },
    {
        headerName: t("This Claim"),
        field: "thisClaim"
    },
    {
        headerName: t("This Certified"),
        field: "thisCertified"
    },
    {
        headerName: t("Payment Claim Reference No."),
        field: "paymentClaimReferenceNo"
    },
    {
        headerName: t("Developer Work Order No."),
        field: "developerWorkOrderNo"
    },
    {
        headerName: t("Work Order Title"),
        field: "workOrderTitle"
    },
    {
        headerName: t("Project"),
        field: "project"
    },
    {
        headerName: t("Update At"),
        field: "updateAt"
    },
    {
        headerName: t("Issued By"),
        field: "issuedBy"
    },
    {
        headerName: t("Responded By"),
        field: "respondedBy"
    },
    {
        headerName: t("Acknowledged By"),
        field: "acknowledgedBy"
    }
]);

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

export const mockData = [
    {
        draftProgressClaimNo: "DVWO-000000010",
        developerName: "DVWO-000000010",
        status: "DVWO-000000010",
        paymentClaimReferenceMonth: "DVWO-000000010",
        thisClaim: "DVWO-000000010",
        thisCertified: "DVWO-000000010",
        paymentClaimReferenceNo: "DVWO-000000010",
        developerWorkOrderNo: "DVWO-000000010",
        workOrderTitle: "DVWO-000000010",
        project: "DVWO-000000010",
        updateAt: "DVWO-000000010",
        issuedBy: "DVWO-000000010",
        respondedBy: "DVWO-000000010",
        acknowledgedBy: "DVWO-000000010"
    }
];
