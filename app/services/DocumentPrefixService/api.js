import { BASE_URL, AUTH_PREFIX } from "../urlConfig/urlConfig";

const DOCUMENT_PREFIX_API = {
    LIST_DOCUMENT_PREFIXES:`${BASE_URL}entities/{companyUuid}/prefix/list`,
    DOCUMENT_PREFIX_DETAILS: `${BASE_URL}entities/{companyUuid}/prefix/details/{prefixUuid}`,
    UPDATE_PREFIX: `${BASE_URL}entities/{companyUuid}/prefix/update`,
    CREATE_PREFIXES: `${BASE_URL}entities/{companyUuid}/prefix/create`
}

export default DOCUMENT_PREFIX_API;