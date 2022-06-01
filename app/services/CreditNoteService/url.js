import { BASE_URL } from "../urlConfig/urlConfig";

const CREDIT_NOTE_API = {
    GET_LIST_CN_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/list`,
    GET_LIST_CN_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/supplier/list`,
    CREATE_CN_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/create/{supplierUuid}`,
    CREATE_CN_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/supplier/create/{buyerCompanyUuid}`,
    GET_LIST_INV_FOR_CREATING_CN_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/list/invoice/supplier/{supplierUuid}`,
    GET_LIST_INV_FOR_CREATING_CN_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/supplier/list/invoice/buyer/{buyerCompanyUuid}`,
    GET_DETAILS_INV_FOR_CREATING_CN_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/create-credit-note-details/{invoiceUuid}`,
    GET_DETAILS_CN_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/details/{cnUuid}`,
    GET_DETAILS_CN_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/supplier/details/{cnUuid}`,
    APPROVE_CN_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/approve`,
    REJECT_CN_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/reject`,
    APPROVE_CN_PENDING_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/approve-pending-approval`,
    REJECT_CN_PENDING_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/reject-pending-approval`,
    VIEW_CN_PDF_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/buyer/pdf/{cnUuid}`,
    VIEW_CN_PDF_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/credit-note/supplier/pdf/{cnUuid}`
};

Object.freeze(CREDIT_NOTE_API);
export default CREDIT_NOTE_API;
