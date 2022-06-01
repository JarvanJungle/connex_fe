import { BASE_URL } from "../urlConfig/urlConfig";

const PRE_PURCHASE_ORDER_API = {
    GET_LIST_PR_TO_BE_CONVERTED_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/to-be-converted/`,
    GET_LIST_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/list`,
    GET_PPO_DETAILS_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/details?uuid={ppoUuid}&prePoGlobalNumber=`,
    GET_PPO_OVERVIEW_DETAILS_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/overview?uuid={ppoUuid}&child={child}`,
    APPROVE_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/approve/{ppoUuid}`,
    REJECT_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/reject/{ppoUuid}`,
    RECALL_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/recall/{ppoUuid}`,
    SEND_BACK_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/send-back/{ppoUuid}`,
    CANCEL_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/cancel/{ppoUuid}`,
    SUBMIT_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/submit/{ppoUuid}`,
    SAVE_AS_DRAFT_PPO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/draft/{ppoUuid}`,
    CONVERT_PR_TO_PPO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/{prUuid}/{supplierUuid}/convert-to-ppo`
};

Object.freeze(PRE_PURCHASE_ORDER_API);
export default PRE_PURCHASE_ORDER_API;
