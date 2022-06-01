const prefix = "/doxa-admin-manage-roles";

const DOXA_ADMIN_MANAGE_ROLES_ROUTES = {
    ROLES_LIST: `${prefix}/roles-list`,
    CREATE_NEW_ROLE: `${prefix}/create-role`,
    ROLE_DETAILS: `${prefix}/role-details`
};

Object.freeze(DOXA_ADMIN_MANAGE_ROLES_ROUTES);
export default DOXA_ADMIN_MANAGE_ROLES_ROUTES;
