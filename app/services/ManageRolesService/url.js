import { BASE_URL } from "../urlConfig/urlConfig";

const prefix = `${BASE_URL}auth`;

const MANAGE_ROLE_API = {
    // ====== Entity Admin ======
    GET_LIST_ROLE_URL: `${prefix}/api/{companyUuid}/rbac/role`,
    CREATE_ROLE_URL: `${prefix}/api/{companyUuid}/rbac/role`,
    ROLE_DETAILS_URL: `${prefix}/api/{companyUuid}/rbac/role/{roleUuid}`,
    UPDATE_ROLE_URL: `${prefix}/api/{companyUuid}/rbac/role/{roleUuid}`,
    ASSIGN_ROLE_URL: `${prefix}/api/{companyUuid}/rbac/user/{userUuid}`,
    GET_ROLE_OF_USER_URL: `${prefix}/api/{companyUuid}/rbac/user/{userUuid}`,
    // ====== Doxa Admin ======
    DOXA_ADMIN_GET_LIST_ROLE_URL: `${prefix}/api/dox/rbac/role`,
    DOXA_ADMIN_CREATE_ROLE_URL: `${prefix}/api/dox/rbac/role`,
    DOXA_ADMIN_ROLE_DETAILS_URL: `${prefix}/api/dox/rbac/role/{roleUuid}`,
    DOXA_ADMIN_UPDATE_ROLE_URL: `${prefix}/api/dox/rbac/role/{roleUuid}`,
    DOXA_ADMIN_DELETE_ROLE_URL: `${prefix}/api/{companyUuid}/rbac/role/{roleUuid}`
};

Object.freeze(MANAGE_ROLE_API);
export default MANAGE_ROLE_API;
