const prefix = "/manage-roles";

const MANAGE_ROLES_ROUTES = {
    ROLES_LIST: `${prefix}/roles-list`,
    CREATE_NEW_ROLE: `${prefix}/create-role`,
    ROLE_DETAILS: `${prefix}/role-details`
};

Object.freeze(MANAGE_ROLES_ROUTES);
export default MANAGE_ROLES_ROUTES;
