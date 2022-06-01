const PROGRESSIVE_ROUTES = {
    SUBMIT_DRAFT_CLAIM: "/progressive-claim/submit-draft-claim",
    SUBMIT_DRAFT_CLAIM_CREATE: "/progressive-claim/draft-claim-form/:dwoUuId",
    SUBMIT_DRAFT_CLAIM_DETAIL: "/progressive-claim/detail",
    SUBMIT_DRAFT_CLAIM_EDIT: "/progressive-claim/edit",

    DRAFT_PROGRESS_CLAIM_LIST: "/draft-progress-claim-list",
    DRAFT_PROGRESS_CLAIM_LIST_CREATE: "/draft-progress-claim-list/:dpcUuid/create",
    DRAFT_PROGRESS_CLAIM_LIST_DETAIL: "/draft-progress-claim-list/detail",
    DRAFT_PROGRESS_CLAIM_LIST_EDIT: "/draft-progress-claim-list/edit",
    OFFICIAL_PROGRESS_CLAIM_LIST_CREATE: "/official-progress-claim-list/:uuid/create",
    OFFICIAL_PROGRESS_CLAIM_LIST: "/official-progress-claim-list",
    ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST: "/architect-official-progress-claim-list",
    ARCHITECT_OFFICIAL_PROGRESS_CLAIM_LIST_CREATE: "/architect-official-progress-claim/:uuid/create",
    SUBMIT_OFFICIAL_CLAIM: "/progressive-claim/submit-official-claim",
    CREATE_DEVELOPER_PROGRESS_CLAIM: "/create-developer-progress-claim",
    WO_DETAILS_CREATE: "/progress-claim/supplier/get-wo/:dwoUuid"
};

export default PROGRESSIVE_ROUTES;
