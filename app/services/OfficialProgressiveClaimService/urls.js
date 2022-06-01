import { BASE_URL } from "../urlConfig/urlConfig";

const DEVELOPER_PROGRESSIVE_CLAIM_REQUEST_FORM_API = {
    DEVELOPER_CLAIM_LIST: `${BASE_URL}developer/{supplierCompanyUuid}/progress-claim/supplier/list`,
    DEVELOPER_CLAIM_CREATE: `${BASE_URL}developer/{supplierCompanyUuid}/progress-claim/supplier/create/{dwoUuid}`,
    OFFICIAL_CLAIM_MC_LIST_SUPPLIER: `${BASE_URL}developer/{supplierCompanyUuid}/progress-claim/supplier/mc-list`,
    OFFICIAL_CLAIM_MC_LIST_BUYER: `${BASE_URL}developer/{buyerCompanyUuid}/progress-claim/buyer/list`,
    OFFICIAL_CLAIM_DETAIL_SUPPLIER: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/get/{pcUuid}`,
    OFFICIAL_CLAIM_DETAIL_BUYER: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/get/{pcUuid}`,
    OFFICIAL_CLAIM_WO_DETAILS: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/get-wo/{dwoUuid}`,
    DRAFT_CLAIM_CREATE: `${BASE_URL}developer/{supplierCompanyUuid}/draft-progress-claim/supplier/create/{dwoUuid}`,
    ARCHITECT_OFFICIAL_CLAIM_MC_LIST_SUPPLIER: `${BASE_URL}developer/{supplierCompanyUuid}/architect/supplier/list`,
    ARCHITECT_OFFICIAL_CLAIM_MC_LIST_BUYER: `${BASE_URL}developer/{buyerCompanyUuid}/architect/buyer/list`,

    OFFICIAL_CLAIM_ISSUE: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/issue/{pcUuid}`,
    OFFICIAL_CLAIM_ACKNOWLEDGEMENT: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/acknowledge/{pcUuid}`,
    OFFICIAL_CLAIM_SUBMIT: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/submit/{pcUuid}`,
    OFFICIAL_CLAIM_APPROVE: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/approve/{pcUuid}`,
    OFFICIAL_CLAIM_REVERT: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/revert/{pcUuid}`,
    OFFICIAL_CLAIM_ACKNOWLEDGEMENT_VALUATION: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/acknowledge/{pcUuid}`,
    OFFICIAL_CLAIM_DETAIL: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/get/{pcUuid}`,
    OFFICIAL_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/list-children/{pcUuid}/{itemParentUuid}`,
    OFFICIAL_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER: `${BASE_URL}developer/{companyUuid}/progress-claim/supplier/list-children/{pcUuid}/{itemParentUuid}`,
    OFFICIAL_CLAIM_SAVE_AS_DRAFT: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/save/{pcUuid}`,
    OFFICIAL_CLAIM_SUBMIT_TO_ARCHITECT: `${BASE_URL}developer/{companyUuid}/progress-claim/buyer/submit-to-architect/{pcUuid}`,


    ARCHITECT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER: `${BASE_URL}developer/{companyUuid}/architect/buyer/list-children/{pcUuid}/{itemParentUuid}`,
    ARCHITECT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER: `${BASE_URL}developer/{companyUuid}/architect/supplier/list-children/{pcUuid}/{itemParentUuid}`,
    ARCHITECT_CLAIM_DETAIL_SUPPLIER: `${BASE_URL}developer/{companyUuid}/architect/supplier/get/{pcUuid}`,
    ARCHITECT_CLAIM_DETAIL_BUYER: `${BASE_URL}developer/{companyUuid}/architect/buyer/get/{pcUuid}`,
    ARCHITECT_ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_ARCHITECT: `${BASE_URL}developer/{companyUuid}/architect/buyer/acknowledge/{pcUuid}`,
    ARCHITECT_ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_MC: `${BASE_URL}developer/{companyUuid}/architect/supplier/acknowledge/{pcUuid}`,
    ARCHITECT_SENT_BACK_ARCHITECT_CERTIFICATE_TO_ARCHITECT: `${BASE_URL}developer/{companyUuid}/architect/supplier/sent-back-to-architect/{pcUuid}`,
    ARCHITECT_SENT_BACK_ARCHITECT_CERTIFICATE_TO_MC: `${BASE_URL}developer/{companyUuid}/architect/buyer/sent-back-to-mc/{pcUuid}`,
    ARCHITECT_SUBMIT: `${BASE_URL}developer/{companyUuid}/architect/buyer/submit/{pcUuid}`,
    ARCHITECT_APPROVED_ARCHITECT_CERTIFICATE: `${BASE_URL}developer/{companyUuid}/architect/buyer/approve/{pcUuid}`,
    ARCHITECT_ISSUE_AC_TO_MC: `${BASE_URL}developer/{companyUuid}/architect/buyer/issue/{pcUuid}`,
    ARCHITECT_CONVERT_TO_INVOICE: `${BASE_URL}developer/{companyUuid}/architect/supplier/convert/{pcUuid}`
};

const DEVELOPER_PROGRESSIVE_CLAIM_MODULE_ROUTE = {
    ...DEVELOPER_PROGRESSIVE_CLAIM_REQUEST_FORM_API
};

Object.freeze(DEVELOPER_PROGRESSIVE_CLAIM_MODULE_ROUTE);
export default DEVELOPER_PROGRESSIVE_CLAIM_MODULE_ROUTE;
