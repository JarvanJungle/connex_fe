import { BASE_URL } from "../urlConfig/urlConfig";

// draft progressive claim module api
const DRAFT_PROGRESSIVE_CLAIM_REQUEST_FORM_API = {
    DRAFT_CLAIM_LIST: `${BASE_URL}developer/{supplierCompanyUuid}/draft-progress-claim/supplier/list`,
    DRAFT_CLAIM_CREATE: `${BASE_URL}developer/{supplierCompanyUuid}/draft-progress-claim/supplier/create/{dwoUuid}`,
    DRAFT_WORKING_ORDER_DETAIL: `${BASE_URL}developer/{supplierCompanyUuid}/draft-progress-claim/supplier/get-wo/{dwoUuid}`,
    DRAFT_CLAIM_MC_LIST_SUPPLIER: `${BASE_URL}developer/{supplierCompanyUuid}/draft-progress-claim/supplier/mc-list`,
    DRAFT_CLAIM_MC_LIST_BUYER: `${BASE_URL}developer/{buyerCompanyUuid}/draft-progress-claim/buyer/list`,
    DRAFT_CLAIM_DETAIL_SUPPLIER: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/get/{dpcUuid}`,
    DRAFT_CLAIM_DETAIL_BUYER: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/get/{dpcUuid}`,
    DRAFT_CLAIM_ISSUE: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/issue/{dpcUuid}`,
    DRAFT_CLAIM_ACKNOWLEDGEMENT: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/acknowledge/{dpcUuid}`,
    DRAFT_CLAIM_SUBMIT: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/submit/{dpcUuid}`,
    DRAFT_CLAIM_APPROVE: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/approve/{dpcUuid}`,
    DRAFT_CLAIM_REVERT: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/revert/{dpcUuid}`,
    DRAFT_CLAIM_ACKNOWLEDGEMENT_VALUATION: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/acknowledge/{dpcUuid}`,
    DRAFT_CLAIM_DETAIL: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/get/{dpcUuid}`,
    DRAFT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/list-children/{dpcUuid}/{itemParentUuid}`,
    DRAFT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/list-children/{dpcUuid}/{itemParentUuid}`,
    DRAFT_CLAIM_SAVE_AS_DRAFT: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/buyer/save/{dpcUuid}`,
    DRAFT_CLAIM_CONVERT_ACTUAL: `${BASE_URL}developer/{companyUuid}/draft-progress-claim/supplier/convert/{dpcUuid}`
};

const DRAFT_PROGRESSIVE_CLAIM_MODULE_ROUTE = {
    ...DRAFT_PROGRESSIVE_CLAIM_REQUEST_FORM_API
};

Object.freeze(DRAFT_PROGRESSIVE_CLAIM_MODULE_ROUTE);
export default DRAFT_PROGRESSIVE_CLAIM_MODULE_ROUTE;
