import { ENTITIES_URL } from "../basicUrlConfig";

const APPROVAL_MATRIX_MANAGEMENT_API = {
    /* APPROVAL MATRIX MANAGEMENT - APIs */
    ALL_APPROVAL_MATRIX_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/list`,
    APPROVAL_MATRIX_FEATURE_LIST_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/details/list`,
    FEATURE_LIST_URL: `${ENTITIES_URL}/{companyUuid}/approval-features/list`,
    APPROVAL_MATRIX_DETAIL_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/details/{approvalUuid}`,
    ACTIVATE_APPROVAL_MATRIX_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/activate/{approvalUuid}`,
    DEACTIVATE_APPROVAL_MATRIX_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/deactivate/{approvalUuid}`,
    CREATE_APPROVAL_MATRIX_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/create`,
    UPDATE_APPROVAL_MATRIX_URL: `${ENTITIES_URL}/{companyUuid}/approval-matrix/update`,
    RETRIEVE_LIST_OF_APPROVAL_MATRIX_DETAILS: `${ENTITIES_URL}/{companyUuid}/approval-matrix/details/list`
    /* END APPROVAL MATRIX MANAGEMENT - APIs */
};

export default APPROVAL_MATRIX_MANAGEMENT_API;
