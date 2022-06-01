import { BASE_ENTITIES } from "../urlConfig/urlConfig";

const DOCUMENT_TEMPLATE_API = {
    GET_DOCUMENT_TEMPLATE_SETTINGS: `${BASE_ENTITIES}/{companyUuid}/template/details`,
    UPDATE_DOCUMENT_TEMPLATE_SETTINGS: `${BASE_ENTITIES}/{companyUuid}/template/update`
};

export default DOCUMENT_TEMPLATE_API;
