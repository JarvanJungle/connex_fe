const PR_ROUTES = {
    RAISE_REQUISITION: "/requisition/raise-requisition",
    PURCHASE_REQUISITION_LIST: "/requisition/pr-list",
    PURCHASE_REQUISITION_DETAILS: "/requisition/pr-details",
    VIEW_REQUISITION_DETAILS: "/requisition/view-pr-details",
    EDIT_PURCHASE_REQUISITION_DETAILS: "/requisition/edit-pr-details",
    EDIT_DRAFT_PURCHASE_REQUISITION: "/requisition/edit-draft-pr",
    COVERT_PURCHASE_REQUISITION: "/purchase-pre-requisitions/convert-to-pr",
    DEVELOP_WORK_REQUEST_DETAILS: "/requisition/wr-details"
};

Object.freeze(PR_ROUTES);
export default PR_ROUTES;
