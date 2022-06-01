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
export const SUPPLIER_BANK_ACCOUNT_STATUS = {
    CREATE: "CREATE",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    APPROVED: "APPROVED"
};
export const SUPPLIER_BANK_ACCOUNT_STATUS_FE = {
    CREATE: "CREATE",
    PENDING_APPROVAL: "PENDING APPROVAL",
    APPROVED: "APPROVED"
};

export const supplierBankAccountColumnDefs = (t) => ([
    {
        headerName: t("Company Code"),
        field: "companyCode",
        suppressSizeToFit: true,
        width: 150
    },
    {
        headerName: t("Company Name"),
        field: "companyname",
        suppressSizeToFit: true,
        width: 200
    },
    {
        headerName: t("Bank Label"),
        field: "bankLabel",
        suppressSizeToFit: true,
        width: 200
    },
    {
        headerName: t("Status"),
        field: "status",
        suppressSizeToFit: true,
        width: 200,
        valueFormatter: (params) => {
            switch (params.value) {
            case SUPPLIER_BANK_ACCOUNT_STATUS.APPROVED:
            {
                return SUPPLIER_BANK_ACCOUNT_STATUS_FE.APPROVED;
            }
            case SUPPLIER_BANK_ACCOUNT_STATUS.PENDING_APPROVAL:
            {
                return SUPPLIER_BANK_ACCOUNT_STATUS_FE.PENDING_APPROVAL;
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

export const supplierBankAccountMockData = [
    {
        companyCode: "NatSteel2",
        companyName: "NatSteel Holdings Pte Ltd",
        bankLabel: "Backup Choice 2",
        status: "APPROVED",
        bankName: "DBS",
        bankAccountNo: "12332188",
        accountHolderName: "Aaron Benny",
        currency: "SGD",
        requestedBy: "Queenie",
        approvedBy: "Sean",
        updatedOn: "10/05/2021"
    },
    {
        companyCode: "NatSteel2",
        companyName: "NatSteel Holdings Pte Ltd",
        bankLabel: "Backup Choice 2",
        status: "APPROVED",
        bankName: "DBS",
        bankAccountNo: "12332188",
        accountHolderName: "Aaron Benny",
        currency: "SGD",
        requestedBy: "Queenie",
        approvedBy: "Sean",
        updatedOn: "10/05/2021"
    },
    {
        companyCode: "NatSteel2",
        companyName: "NatSteel Holdings Pte Ltd",
        bankLabel: "Backup Choice 2",
        status: "APPROVED",
        bankName: "DBS",
        bankAccountNo: "12332188",
        accountHolderName: "Aaron Benny",
        currency: "SGD",
        requestedBy: "Queenie",
        approvedBy: "Sean",
        updatedOn: "10/05/2021"
    }
];

export const initialValues = {
    defaultAccountBeforeApproval: false,
    companyCode: "",
    companyName: "",
    companyRegNo: "",
    countryOfOrigin: "",
    paymentTerms: "",

    bankLabel: "",
    country: "",
    bankName: "",
    bankAccountNo: "",
    accountHolderName: "",
    currency: "",
    swiftCode: "",
    defaultBankAccount: "",

    branch: "",
    branchCode: "",
    branchCity: "",
    branchAddressLine1: "",
    branchAddressLine2: "",
    postalCode: "",
    state: ""
};

export const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true
};

export const csvTemplate = [
    { label: "Company Code", key: "companyCode" },
    { label: "Bank Label", key: "bankLabel" },
    { label: "Country", key: "country" },
    { label: "Name", key: "name" },
    { label: "Bank Account No.", key: "bankAccountNo" },
    { label: "Account Holder Name", key: "accountHolderName" },
    { label: "Currency", key: "currency" },
    { label: "Swift Code", key: "swiftCode" },
    { label: "Branch", key: "branch" },
    { label: "Branch Code", key: "branchCode" },
    { label: "Branch City", key: "branchCity" },
    { label: "Branch Address Line 1", key: "branchAddressLine1" },
    { label: "Branch Address Line 2", key: "branchAddressLine2" },
    { label: "Postal Code", key: "postalCode" },
    { label: "State/ Province", key: "state/Province" },
    { label: "Is Default", key: "isDefault" }
];

export const csvTemplateFileName = "SupplierBankAccount.csv";
