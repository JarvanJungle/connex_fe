import { BASE_URL } from "../urlConfig/urlConfig";

const PAYMENT_API = {
    PENDING_PAYMENT_LIST: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/approved-invoice`,
    PAYMENT_CREATE_DETAILS: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/detail-payment`,
    PAYMENT_LIST: `${BASE_URL}payment/{companyUuid}/payment`,
    PAYMENT_DETAILS: `${BASE_URL}payment/{companyUuid}/payment/{paymentUuid}`,
    CREATE_PAYMENT: `${BASE_URL}payment/{companyUuid}/payment`,
    SAVE_AS_DRAFT_PAYMENT: `${BASE_URL}payment/{companyUuid}/payment/save-draft`,
    APPROVAL_PAYMENT: `${BASE_URL}payment/{companyUuid}/payment/{paymentUuid}/approve`,
    REJECT_PAYMENT: `${BASE_URL}payment/{companyUuid}/payment/{paymentUuid}/reject`,
    PAYMENT_OVERVIEW: `${BASE_URL}payment/{companyUuid}/payment/overview?uuid={paymentUuid}&child={child}`,
    OVERVIEW_BY_INVOICE: `${BASE_URL}payment/{companyUuid}/payment/overview-by-invoice?uuid={uuid}&child={child}`,
    SEND_BACK_PAYMENT: `${BASE_URL}payment/{companyUuid}/payment/{paymentUuid}/send-back`
};

Object.freeze(PAYMENT_API);
export default PAYMENT_API;
