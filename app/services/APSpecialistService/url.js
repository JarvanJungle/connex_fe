import { BASE_URL } from "../urlConfig/urlConfig";

const AP_SPECIALIST_API = {
    GET_LIST_AP_SPECIALIST_URL: `${BASE_URL}entities/{companyUuid}/ap-specialist/list`,
    CREATE_AP_SPECIALIST_URL: `${BASE_URL}entities/{companyUuid}/ap-specialist/create`,
    EDIT_AP_SPECIALIST_URL: `${BASE_URL}entities/{companyUuid}/ap-specialist/edit`,
    GET_AP_SPECIALIST_DETAILS_URL: `${BASE_URL}entities/{companyUuid}/ap-specialist/details/{apSpecialistUuid}`,
    MASS_UPLOAD_AP_SPECIAL_LIST_URL: `${BASE_URL}entities/{companyUuid}/ap-specialist/mass-upload`
};

Object.freeze(AP_SPECIALIST_API);
export default AP_SPECIALIST_API;
