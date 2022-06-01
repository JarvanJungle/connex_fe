import { BASE_URL, AUTH_PREFIX } from "../urlConfig/urlConfig";

const FEATURES_MATRIX_API = {
    GET_USER_AUTHORITIES: `${BASE_URL}${AUTH_PREFIX}/{companyUuid}/{userUuid}/authorities`,
    GET_COMPANY_AUTHORITIE: `${BASE_URL}${AUTH_PREFIX}/{companyUuid}/authorities`,
    GET_LIST_MODULE: `${BASE_URL}${AUTH_PREFIX}/{companyUuid}/modules`,
    GRANT_USER_AUTHORITIES: `${BASE_URL}${AUTH_PREFIX}/{companyUuid}/{userUuid}/authorities`
};

export default FEATURES_MATRIX_API;
