import { BASE_ENTITIES } from "../urlConfig/urlConfig";

const URL_MANAGE_PROJECT = {
    // mange project url api
    CREATE_PROJECT_URL: `${BASE_ENTITIES}/{companyUuid}/projects/create`,
    PROJECT_DETAILS_URL: `${BASE_ENTITIES}/{companyUuid}/projects/get-project-details/{projectCode}`,
    UPDATE_PROJECT_URL: `${BASE_ENTITIES}/{companyUuid}/projects/update`,

    // manage project routes
    LIST_PROJECT: "/manage-project",
    CREATE_PROJECT: "/create-project",
    PROJECT_DETAILS: "/project-details/?projectCode="
};

Object.freeze(URL_MANAGE_PROJECT);
export default URL_MANAGE_PROJECT;
