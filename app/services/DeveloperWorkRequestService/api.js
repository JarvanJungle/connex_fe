import { BASE_URL, AUTH_PREFIX } from "../urlConfig/urlConfig";

const DEVELOPER_WORK_REQUEST_API = {
    GET_WORK_REQUISITION_LIST: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/list`,
    CREATE_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/submit`,
    GET_WORK_REQUISITION_DETAILS: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/get/{dwrUuid}`,
    APPROVE_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/approve/{dwrUuid}`,
    CANCEL_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/cancel/{dwrUuid}`,
    RECALL_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/recall/{dwrUuid}`,
    REJECT_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/reject/{dwrUuid}`,
    SEND_BACK_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/sent-back/{dwrUuid}`,
    SAVE_WORK_REQUISITION_DRAFT: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/save/{dwrUuid}`,
    SUBMIT_WORK_REQUISITION: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/submit/{dwrUuid}`,
    GET_LIST_CHILD: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/list-children/{dwrUuid}/{itemParentUuid}`,
    GET_LIST_CHILD_BY_SUPPLIER: `${BASE_URL}developer/{companyUuid}/work-requisition/supplier/list-children/{dwrUuid}/{itemParentUuid}`,
    CONVERT_TO_DVWO: `${BASE_URL}developer/{companyUuid}/work-requisition/buyer/convert/{dwrUuid}`
};

export default DEVELOPER_WORK_REQUEST_API;
