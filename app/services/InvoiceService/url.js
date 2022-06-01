import { BASE_URL } from "../urlConfig/urlConfig";

const INVOICE_API = {
    GET_LIST_INV_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/list`,
    GET_LIST_INV_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/list`,
    GET_LIST_INV_PENDING_AP_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/list/pending`,
    GET_LIST_DO_FOR_CREATING_INV_SUPPLIER_URL: `${BASE_URL}purchase/{companyUuid}/invoice/supplier/do/list/buyer/{buyerCompanyUuid}`,
    GET_LIST_PO_FOR_CREATING_INV_SUPPLIER_URL: `${BASE_URL}purchase/{companyUuid}/invoice/supplier/po/list/buyer/{buyerCompanyUuid}`,
    GET_LIST_PO_FOR_CREATING_INV_BUYER_URL: `${BASE_URL}purchase/{companyUuid}/invoice/buyer/po/list/supplier/{buyerUuid}`,
    CREATE_INV_NON_PROJECT_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/create/non-project/supplier/{supplierUuid}`,
    CREATE_INV_NON_PROJECT_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/create/non-project/buyer/{buyerCompanyUuid}`,
    CREATE_INV_PROJECT_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/create/project/supplier/{supplierUuid}`,
    CREATE_INV_PROJECT_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/create/project/buyer/{buyerCompanyUuid}`,
    CREATE_INV_DO_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/create/delivery-order/buyer/{buyerCompanyUuid}`,
    GET_PO_DETAILS_FOR_CREATING_INV_URL: `${BASE_URL}purchase/{companyUuid}/invoice/create-po-invoice-details`,
    GET_DO_DETAILS_FOR_CREATING_INV_URL: `${BASE_URL}purchase/{companyUuid}/invoice/create-do-invoice-details`,
    GET_INV_DETAILS_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/get/invoice-uuid/{invoiceUuid}`,
    GET_INV_DETAILS_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/get/invoice-uuid/{invoiceUuid}`,
    GET_INV_PENDING_AP_DETAILS_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/pending/invoice-uuid/{invoiceUuid}`,
    GET_INV_OVERVIEW_DETAILS_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/overview?uuid={invoiceUuid}&child={child}`,
    GET_INV_OVERVIEW_DETAILS_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/overview?uuid={invoiceUuid}&child={child}`,
    ISSUE_INV_PENDING_AP_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/issue-pending-approval/invoice-uuid/{invoiceUuid}`,
    REJECT_INVOICE_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/reject/invoice-uuid/{invoiceUuid}`,
    REISSUE_INV_PROJECT_BUYER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/reissue/project/supplier/{supplierUuid}/invoice-uuid/{invoiceUuid}`,
    REISSUE_INV_PROJECT_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/reissue/project/buyer/{buyerCompanyUuid}/invoice-uuid/{invoiceUuid}`,
    APPROVE_INVOICE_PENDING_AP_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/approve/invoice-uuid/{invoiceUuid}`,
    REJECT_INVOICE_PENDING_AP_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/reject-pending-approval/invoice-uuid/{invoiceUuid}`,
    VIEW_PDF_INVOICE_URL: `${BASE_URL}invoice/{companyUuid}/invoice/buyer/pdf/{invoiceUuid}`,
    VIEW_PDF_INVOICE_SUPPLIER_URL: `${BASE_URL}invoice/{companyUuid}/invoice/supplier/pdf/{invoiceUuid}`,
    CREATE_OPC_INVOICE_SUPPLIER_URL: `${BASE_URL}developer/{companyUuid}/invoice/supplier/create/{invoiceUuid}`,
    GET_OPC_INVOICE_DETAIL_SUPPLIER_URL: `${BASE_URL}developer/{companyUuid}/invoice/supplier/get/{invoiceUuid}`,
    GET_OPC_INVOICE_DETAIL_BUYER_URL: `${BASE_URL}developer/{companyUuid}/invoice/buyer/get/{invoiceUuid}`,

    GET_LIST_OPC_INVOICE_BUYER_URL: `${BASE_URL}developer/{companyUuid}/invoice/buyer/list`,
    GET_LIST_OPC_INVOICE_SUPPLIER_URL: `${BASE_URL}developer/{companyUuid}/invoice/supplier/list`,
    OPC_APPROVE_URL: `${BASE_URL}developer/{companyUuid}/invoice/buyer/approve/{invoiceUuid}`,
    OPC_APPROVE_INVOICE_PENDING_AP_URL: `${BASE_URL}developer/{companyUuid}/invoice/buyer/approve-route/{invoiceUuid}`,
    GET_LIST_OPC_INVOICE_PENDING_APPROVAL_BUYER_URL: `${BASE_URL}developer/{companyUuid}/invoice/buyer/list/pending`
};

Object.freeze(INVOICE_API);
export default INVOICE_API;
