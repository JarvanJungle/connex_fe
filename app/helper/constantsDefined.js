const CUSTOM_CONSTANTS = {
    DDMMYYYhhmmss: "DD/MM/YYYY hh:mm:ss",
    DDMMYYYhhmmssA: "DD/MM/YYYY hh:mm:ss A",
    DDMMYYYHHmmss: "DD/MM/YYYY HH:mm:ss",
    DDMMYYYY: "DD/MM/YYYY",
    YYYYMMDD: "YYYY-MM-DD",
    YYYYMMDDWITHFLASH: "YYYY/MM/DD",
    YYYYMMDDHHmmss: "YYYY-MM-DD HH:mm:ss",
    YYYYMMDDTHHmm: "YYYY-MM-DDTHH:mm",
    DEFAULT_PRECISION_NUMBER: 2,
    CURRENCY: "SGD",
    YYYYMM: "YYYY-MM"
};

export const CUSTOM_LOCATION_DATE_TYPE = Object.freeze({
    ES: "es"
});

export const LS_KEYS = Object.freeze({
    COMPANY_ROLE: "companyRole",
    USER: "user"
});

export const RESPONSE_STATUS = Object.freeze({
    OK: "OK",
    BAD_REQUEST: "BAD_REQUEST",
    FULFILLED: "fulfilled",
    REJECTED: "rejected"
});

export const TOAST_PROPS = Object.freeze({
    DURATION: 5000,
    TOP_RIGHT_POS: "top-right",
    CAN_DRAG: true,
    CAN_NOT_DRAG: false
});

export const PROJECT_FORECAST_ROLES = Object.freeze({
    PROJECT_IN_CHARGE: "PROJECT_IN_CHARGE",
    PROJECT_ADMIN: "PROJECT_ADMIN",
    PROJECT_TEAM_MEMBER: "PROJECT_TEAM_MEMBER"
});

export const FEATURE_ROUTE_BASED = Object.freeze({
    LS_FEATURE_BASED_ON: "featureBasedOn",
    ADMIN: "ADMIN",
    USER: "USER",
    CURRENT_COMPANY: "currentCompanyUUID",
    CURRENT_CATEGORY: "currentCategory",
    IS_BUYER: "isBuyer"
});

export const PURCHASE_REQUISITION_STATUS = Object.freeze({
    PENDING_APPROVAL: "PENDING_APPROVAL",
    RECALLED: "RECALLED",
    CANCELLED: "CANCELLED",
    SAVE_AS_DRAFT: "SAVED_AS_DRAFT",
    SENT_BACK: "SENT_BACK",
    REJECTED: "REJECTED",
    APPROVED: "APPROVED_TO_CONVERT",
    PARTIALLY_CONVERTED: "PARTIALLY_CONVERTED",
    PENDING_CONVERT_TO_PRE_PO: "PENDING CONVERT TO PRE-PO",
    CONVERTED_TO_PO: "CONVERTED_TO_PO",
    CONVERTED_TO_PPO: "CONVERTED_TO_PPO"
});

export const CONTRACT_REQUEST_LIST_STATUS = Object.freeze({
    PENDING_APPROVAL: "Request Pending Approval",
    PENDING_APPROVAL_CONTRACT: "Pending approval",
    PENDING_ISSUE_CONTRACT: "Pending issue",
    SAVE_AS_DRAFT: "Draft Contract Request",
    SAVE_AS_DRAFT_CONTRACT: "Draft contract",
    SEND_BACK_CONTRACT: "Sent back",
    PENDING_CONVERSION: "Contract Pending Conversion",
    PENDING_SUBMISSION: "Pending Submission",
    PENDING_ESIGN: "Pending eSign",
    PENDING_ISSUE: "Pending Issue",
    PENDING_ACKNOWLEDGEMENT: "Pending acknowledgment",
    COMPLETED: "Complete",
    TERMINATED: "Terminated",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    RECALLED: "Recalled",
    CONVERTED: "Converted",
    SEND_BACK: "Sent Back",
    CONVERTED_TO_CONTRACT: "Converted to Contract"
});

export const CONTRACT_TYPE_LIST = [
    {
        name: "LUMP SUM",
        value: "LUMP_SUM"
    },
    {
        name: "REMEASUREMENT",
        value: "REMEASUREMENT"
    }
];

export const CONTRACT_TYPES = {
    LUMP_SUM: "LUMP_SUM",
    REMEASUREMENT: "REMEASUREMENT"
};

export const PROJECT_TYPES = {
    FORECASTED: "FORECASTED"
};

export const DWR_STATUSES = {
    PENDING_SUBMISSION: "PENDING_SUBMISSION",
    PENDING_APPROVAL: "PENDING_APPROVAL",
    PENDING_CONVERT_TO_DVWO: "PENDING_CONVERT_TO_DVWO",
    SENT_BACK: "SENT_BACK",
    REJECTED: "REJECTED",
    CONVERTED_TO_DVWO: "CONVERTED_TO_DVWO",
    RECALLED: "RECALLED",
    CANCELLED: "CANCELLED"
};

export const DWR_ACTIONS = {
    APPROVE: "APPROVE",
    CANCEL: "CANCEL",
    RECALL: "RECALL",
    REJECT: "REJECT",
    SAVE_AS_DRAFT: "SAVE_AS_DRAFT",
    SUBMIT: "SUBMIT",
    SEND_BACK: "SEND_BACK",
    CONVERT_TO_DVWO: "CONVERT_TO_DVWO"
};

export const DWO_STATUSES = {
    ISSUED: "ISSUED",
    IN_PROGRESS: "IN_PROGRESS",
    RECALLED: "RECALLED",
    CANCELLED: "CANCELLED",
    PENDING_ISSUE: "PENDING_ISSUE"
};

export const VENDOR_ACK = {
    ACKNOWLEDGED: "ACKNOWLEDGED"
};

export const FEATURE = Object.freeze({
    PPR: "PPR",
    PR: "PR",
    PPO: "PPO",
    PO: "PO",
    GR: "GR",
    INV: "INV",
    MPAYM: "MPAYM",
    HPAYM: "HPAYM",
    DWR: "dwr",
    DPC: "DPC",
    WR: "WR",
    VR: "VR",
    BC: "BC",
    PAYMENT_TERM: "paymentTerm",
    COMPANY_USER: "cpUser",
    GL: "gl",
    ADDRESS: "address",
    ROLE: "rbacRole",
    APPROVAL_MATRIX: "approvalMatrix",
    SUB_ENTITY: "subEntity",
    ORGANIZATION_USER: "user",
    DWO: "dwo",
    INVF: "INVF",
    DEVF: "DEVF",
    CURRENCY: "currency",
    TRADE: "trade",
    UOM: "uom",
    CONTRACT: "contract",
    CATALOGUE: "catalogue",
    DO: "DO",
    TAX: "tax",
    PAYMENT_CYCLE: "paymentCycle",
    WO: "WO",
    SUPPLIER_BANK_ACCOUNT: "supplierBankAccount",
    RFQF: "RFQF",
    FEATURE_MATRIX: "featureMatrix",
    DOCUMENT_PREFIX: "managePrefix",
    CREDIT_NOTE: "CN",
    CATEGORY: "category",
    BANK_CHARGE: "BC",
    PROJECT: "project",
    BANK_ACCOUNT: "bankAccount",
    PROJECT_FORECAST: "projectForeCast",
    EXTERNAL_VENDOR: "vendor",
    CONNECTION: "connection",
    AP_SPECIALIST: "apSpecialist",
    PAYMENT_SETTING: "pms",
    APPROVAL_CONFIG: "approvalConfiguration"
});

export const ROLES = Object.freeze({
    DOXA_ADMIN: "DOXA_ADMIN"
});

export const WEB_STORAGE_KEY = {
    TOKEN: "token"
};

Object.freeze(CUSTOM_CONSTANTS);
export default CUSTOM_CONSTANTS;
