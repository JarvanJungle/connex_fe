import { BASE_URL } from "../urlConfig/urlConfig";

const URL_PURCHASE_REQUEST = {
    // purchase request url api
    GET_LIST_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/list`,
    CREATE_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/create`,
    GET_DETAILS_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/details?uuid={purchaseUuid}&prGlobalNumber=`,
    GET_DETAILS_PURCHASE_REQUISITION_OVERVIEW_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/overview?uuid={purchaseUuid}&child={child}`,
    CANCEL_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/cancel`,
    RECALL_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/recall`,
    APPROVE_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/approve`,
    REJECT_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/reject`,
    SEND_BACK_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/send-back`,
    EDIT_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/edit`,
    EDIT_DRAFT_PURCHASE_REQUISITION_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/edit-draft`,
    CONVERT_PPR_TO_PR_URL: `${BASE_URL}purchase/{companyUuid}/prerequisition/convert-to-pr/{pprUuid}`,
    SEND_BACK_PPR_URL: `${BASE_URL}purchase/{companyUuid}/prerequisition/send-back?pprUuid={pprUuid}`
};

Object.freeze(URL_PURCHASE_REQUEST);
export default URL_PURCHASE_REQUEST;
