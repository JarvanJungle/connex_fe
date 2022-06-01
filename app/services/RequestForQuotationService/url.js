import { BASE_URL } from "../urlConfig/urlConfig";

const prefix = `${BASE_URL}purchase`;

const RFQ_URLS = {
    RFQS_LIST_BUYER_URL: `${prefix}/{companyUuid}/request-for-quotation/buyer/list`,
    RFQS_LIST_SUPPLIER_URL: `${prefix}/{companyUuid}/request-for-quotation/supplier/list`,
    SAVE_AS_DRAFT_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/save-as-draft`,
    SUBMIT_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/submit`,
    DETAILS_RFQ_BUYER_URL: `${prefix}/{companyUuid}/request-for-quotation/buyer/details/{rfqUuid}`,
    DETAILS_RFQ_SUPPLIER_URL: `${prefix}/{companyUuid}/request-for-quotation/supplier/details/{rfqUuid}`,
    DETAILS_RFQ_UNCONNECTED_SUPPLIER_URL: `${prefix}/rfq-token-access/details?token={token}`,
    CLOSE_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/close`,
    CANCEL_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/cancel/{rfqUuid}`,
    EDIT_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/edit/{rfqUuid}`,
    SUBMIT_QUOTE_URL: `${prefix}/{companyUuid}/request-for-quotation/supplier/submit/quotations`,
    UNCONNECTED_SUPPLIER_SUBMIT_URL: `${prefix}/rfq-token-access/supplier/submit/quotations?token={token}`,
    UPDATE_QUOTE_URL: `${prefix}/{companyUuid}/request-for-quotation/supplier/edit/quotations`,
    SHORTLIST_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/shortlist`,
    RECALL_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/recall`,
    SEND_BACK_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/send-back`,
    APPROVE_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/approve`,
    BUYER_SEND_NEGOTIATION_URL: `${prefix}/{companyUuid}/request-for-quotation/buyer/send-negotiation/{rfqUuid}`,
    SUPPLIER_SEND_NEGOTIATION_URL: `${prefix}/{companyUuid}/request-for-quotation/supplier/send-negotiation/{rfqUuid}`,
    CONVERT_RFQ_TO_PO_URL: `${prefix}/{companyUuid}/request-for-quotation/{rfqUuid}/{supplierUuid}/convert-to-po`,
    CONVERT_RFQ_TO_CONTRACT_URL: `${prefix}/{companyUuid}/request-for-quotation/{rfqUuid}/{supplierUuid}/convert-to-contract`,
    REOPEN_RFQ_URL: `${prefix}/{companyUuid}/request-for-quotation/reopen`,
    RFQ_OVERVIEW: `${prefix}/{companyUuid}/request-for-quotation/overview?uuid={rfqUuid}&child={child}`
};

Object.freeze(RFQ_URLS);
export default RFQ_URLS;
