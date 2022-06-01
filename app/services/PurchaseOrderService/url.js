import { BASE_URL } from "../urlConfig/urlConfig";

const PURCHASE_ORDER_API = {
    GET_LIST_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/list`,
    GET_LIST_PO_SUPPLIER_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/supplier/list`,
    CONVERT_PPO_TO_PO_URL: `${BASE_URL}purchase/{companyUuid}/pre-purchase-order/convert-to-po/{ppoUuid}`,
    GET_DETAILS_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/get/{poUuid}`,
    GET_DETAILS_PO_OVERVIEW_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/overview?uuid={poUuid}&child={child}`,
    GET_DETAILS_PO_SUPPLIER_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/supplier/get/{poUuid}`,
    ISSUE_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/issue/{poUuid}`,
    CANCEL_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/cancel/{poUuid}`,
    REJECT_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/supplier/reject/{poUuid}`,
    ACKNOWLEDGE_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/supplier/acknowledge/{poUuid}`,
    CLOSE_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/close/{poUuid}`,
    VIEW_PO_PDF_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/pdf/{poUuid}`,
    VIEW_PO_PDF_SUPPLIER_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/supplier/pdf/{poUuid}`,
    GET_WORK_ORDER_LIST: `${BASE_URL}developer/{companyUuid}/work-order/buyer/list`,
    GET_WORK_ORDER_LIST_BY_SUPPLIER: `${BASE_URL}developer/{companyUuid}/work-order/supplier/list`,
    GET_WORK_ORDER_DETAIL: `${BASE_URL}developer/{companyUuid}/work-order/buyer/get/{dwoUuid}`,
    GET_WORK_ORDER_DETAIL_BY_SUPPLIER: `${BASE_URL}developer/{companyUuid}/work-order/supplier/get/{dwoUuid}`,
    RECALL_WO: `${BASE_URL}developer/{companyUuid}/work-order/buyer/{dwoUuid}/recall`,
    RERJECT_WO: `${BASE_URL}developer/{companyUuid}/work-order/supplier/{dwoUuid}/reject`,
    ISSUE_WO: `${BASE_URL}developer/{companyUuid}/work-order/buyer/{dwoUuid}/issue`,
    CANCEL_WO: `${BASE_URL}developer/{companyUuid}/work-order/buyer/{dwoUuid}/cancel`,
    ACKNOWLEDGE_WO: `${BASE_URL}developer/{companyUuid}/work-order/supplier/{dwoUuid}/acknowledge`,
    GET_LIST_CHILD: `${BASE_URL}developer/{companyUuid}/work-order/buyer/list-children/{dwrUuid}/{itemParentUuid}`,
    GET_LIST_CHILD_BY_SUPPLIER: `${BASE_URL}developer/{companyUuid}/work-order/supplier/list-children/{dwrUuid}/{itemParentUuid}`,
    CONVERT_PR_TO_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-requisition/{prUuid}/{supplierUuid}/convert-to-po`,
    CONVERT_PPR_TO_PO_URL: `${BASE_URL}purchase/{companyUuid}/prerequisition/convert-to-po/{pprUuid}/{supplierUuid}`,
    SUBMIT_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/submit/{poUuid}`,
    APPROVE_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/approve/{poUuid}`,
    BUYER_REJECT_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/reject/{poUuid}`,
    SEND_BACK_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/send-back/{poUuid}`,
    RECALL_PO_URL: `${BASE_URL}purchase/{companyUuid}/purchase-order/buyer/recall/{poUuid}`,
    GET_LIST_PPR_TO_BE_CONVERTED_URL: `${BASE_URL}purchase/{companyUuid}/prerequisition/pending-to-po`
};

Object.freeze(PURCHASE_ORDER_API);
export default PURCHASE_ORDER_API;
