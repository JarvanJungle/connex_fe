import { BASE_URL } from "../urlConfig/urlConfig";

const prefix = `${BASE_URL}entities`;

const APPROVAL_CONFIG_API = {
    GET_APPROVAL_CONFIG_URL: `${prefix}/{companyUuid}/approval-configuration/get`,
    UPDATE_APPROVAL_CONFIG_URL: `${prefix}/{companyUuid}/approval-configuration/update`,
    CHECK_APPROVAL_CONFIG_BY_FEATURE_URL: `${prefix}/{companyUuid}/approval-matrix/check/{featureCode}`
};

Object.freeze(APPROVAL_CONFIG_API);
export default APPROVAL_CONFIG_API;
