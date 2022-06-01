import { BASE_URL } from "../urlConfig/urlConfig";

const GOODS_RECEIPT_API = {
    GET_LIST_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/list`,
    CREATE_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/create`,
    APPROVE_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/approve`,
    EDIT_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/edit-draft`,
    DETAILS_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/details?uuid={grUuid}&grGlobalNumber={grGlobalNumber}`,
    DETAILS_GR_OVERVIEW_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/overview?uuid={grUuid}&child={child}`,
    REJECT_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/reject/{grUuid}`,
    GET_LIST_DO_FOR_CREATING_GR_URL: `${BASE_URL}purchase/{companyUuid}/delivery-order/list/for-gr`,
    GET_LIST_PO_FOR_CREATING_GR_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/list/for-gr`,
    SUBMIT_GR_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/submit`,
    GET_DO_DETAILS_FOR_CREATING_GR_URL: `${BASE_URL}purchase/{companyUuid}/delivery-order/details/for-gr`,
    GET_PO_DETAILS_FOR_CREATING_GR_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/details/for-gr`,
    SAVE_AS_DRAFT_URL: `${BASE_URL}purchase/{companyUuid}/goods-receipt/draft`
};

Object.freeze(GOODS_RECEIPT_API);
export default GOODS_RECEIPT_API;
