import { CONTRACT_LIST_URL } from "services/urlConfig/UrlFeatureConfigurations/basicUrlConfig";
import { BASE_URL } from "../urlConfig/urlConfig";

// contract module api
const CONTRACT_REQUEST_FORM_API = {
    CONTRACT_REQUEST_LIST_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/list`,
    CONTRACT_REQUEST_DETAIL_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/details/{contractRequestUuid}`,
    CONTRACT_REQUEST_APPROVE_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/approve/{contractRequestUuid}`,
    CONTRACT_REQUEST_REJECT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/reject/{contractRequestUuid}`,
    CONTRACT_REQUEST_RECALL_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/recall/{contractRequestUuid}`,
    CONTRACT_REQUEST_CANCEL_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/cancel/{contractRequestUuid}`,
    CONTRACT_REQUEST_SEND_BACK_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/sentback/{contractRequestUuid}`,
    CONTRACT_ISSUE_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/issue/contract-uuid/{contractUuid}`,
    CONTRACT_ACKNOWLEDGE_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/supplier/acknowledge/contract-uuid/{contractUuid}`,
    CONTRACT_REQUEST_DRAFT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/save-draft`,
    CONTRACT_REQUEST_SUBMIT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract-request/submit`,
    CONTRACT_REQUEST_CONVERT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/convert/{contractRequestUuid}`,
    CONTRACT_DRAFT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/save-draft/contract-uuid/{contractUuid}`,
    CONTRACT_APPROVE_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/approve/contract-uuid/{contractUuid}`,
    CONTRACT_SEND_BACK_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/send-back/contract-uuid/{contractUuid}`,
    CONTRACT_REJECT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/reject/contract-uuid/{contractUuid}`,
    CONTRACT_SUBMIT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/submit/contract-uuid/{contractUuid}`,
    CONTRACT_DETAILS_URL: `${BASE_URL}contract/{companyUuid}/contract-request/details/`,
    CONTRACT_BUDGET_DETAILS_URL: `${BASE_URL}entities/{companyUuid}/project-forecast/budget-details/{projectCode}`,
    CONTRACT_BUYER_LIST_URL: `${BASE_URL}contract/{companyUuid}/contract/buyer/list`,
    CONTRACT_SUPPLIER_LIST_URL: `${BASE_URL}contract/{companyUuid}/contract/supplier/list`,
    CONTRACT_DETAIL_BUYER_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/get/contract-uuid/{contractUuid}`,
    CONTRACT_DETAIL_SUPPLIER_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/supplier/get/contract-uuid/{contractUuid}`
};

const CONTRACT_API = {
    CONTRACT_TERMINATE_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/terminate/contract-uuid/{contractUuid}`,
    CONTRACT_REJECT_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/reject/contract-uuid/{contractUuid}`,
    CONTRACT_SEND_BACK_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/send-back/contract-uuid/{contractUuid}`,
    CONTRACT_RECALL_URL: `${CONTRACT_LIST_URL}/{companyUuid}/contract/buyer/recall/contract-uuid/{contractUuid}`
};

// contract module routes
const prefix = "/contracting/";

const CONTRACT_REQUEST_FORM_ROUTE = {
    CONTRACT_LIST: `${prefix}contract-list`,
    CONTRACT_REQUEST_LIST: `${prefix}contract-request-list`,
    CONTRACT_REQUEST_FORM: `${prefix}contract-request-form`,
    CONTRACT_REQUEST_FORM_DETAIL: `${prefix}contract-request-form/:uuid`,
    CONTRACT_FORM_DETAIL: `${prefix}contract-form/:uuid`
};

const CONTRACT_MODULE_ROUTE = {
    ...CONTRACT_REQUEST_FORM_API,
    ...CONTRACT_API,
    ...CONTRACT_REQUEST_FORM_ROUTE
};

Object.freeze(CONTRACT_MODULE_ROUTE);
export default CONTRACT_MODULE_ROUTE;
