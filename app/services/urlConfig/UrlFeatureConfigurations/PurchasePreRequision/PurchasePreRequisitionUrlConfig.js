import { PURCHASE_URL } from "../basicUrlConfig";

const PPR_ROUTING = {
    /* PRE-REQUISITION - App Routing */
    RAISE_PRE_REQUISITIONS: "/pre-requisitions/create",
    DETAIL_PRE_REQUISITIONS: "/pre-requisitions/details",
    RENTAL_PRE_REQUISITIONS_LIST: "",
    PURCHASE_PRE_REQUISITIONS_LIST: "/purchase-pre-requisitions/list"
    /* END PRE-REQUISITION - App Routing */
};

const PPR_API = {
    /* PRE-REQUISITION - APIs */
    CREATE_PRE_REQUISITIONS_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/create`,
    RENTAL_PRE_REQUISITIONS_LIST_URL: `${PURCHASE_URL}`,
    PURCHASE_PRE_REQUISITIONS_LIST_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/list/`,

    ADD_BATCH_OF_DOCUMENTS_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/add-documents`,
    CANCEL_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/cancel`,
    CREATE_INTERNAL_CONVERSATION_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/create-internal-conversation`,
    EDIT_A_SENT_BACK_OR_RECALL_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/edit`,
    GET_PPR_DETAIL_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/get`,
    GET_PPR_OVERVIEW_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/overview?uuid={uuid}&child={child}`,
    GET_INTERNAL_CONVERSATION_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/get-internal-conversation`,
    LIST_DOCUMENTS_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/list-documents`,
    RECALL_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/recall`,
    SAVE_AS_DRAFT_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/save-draft`,
    SEND_BACK_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/send-back`,

    APPROVE_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/approve`,
    REJECT_PPR_URL: `${PURCHASE_URL}/{companyUuid}/prerequisition/reject`
    /* END PRE-REQUISITION - APIs */
};

export { PPR_ROUTING, PPR_API };
