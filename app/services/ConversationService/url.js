import { BASE_URL } from "../urlConfig/urlConfig";

const CONVERSATION_API = {
    CREATE_EXTERNAL_URL: `${BASE_URL}conversation/{companyUuid}/external`,
    CREATE_INTERNAL_URL: `${BASE_URL}conversation/{companyUuid}/internal`,
    GET_DETAIL_EXTERNAL_URL: `${BASE_URL}conversation/{companyUuid}/external/{featureUuid}`,
    GET_DETAIL_INTERNAL_URL: `${BASE_URL}conversation/{companyUuid}/internal/{featureUuid}`
};

Object.freeze(CONVERSATION_API);
export default CONVERSATION_API;
