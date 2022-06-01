import axios from "axios";
import CONFIG from "./urlConfig";

const COMPANIES_LIST_URL = CONFIG.GET_COMPANIES_LIST;
const { CREATE_COMPANY_URL, COMPANIES_LIST_UNDER_ENTITY_URL } = CONFIG;
const { GET_COMPANY_URL } = CONFIG;
const { UPDATE_COMPANY_URL } = CONFIG;
const { DEACTIVATE_COMPANY_URL } = CONFIG;
const { REACTIVATE_COMPANY_URL } = CONFIG;

class CompaniesService {
    getCompanies() {
        return axios.get(COMPANIES_LIST_URL);
    }

    getCompaniesUnderEntity(entityUuid) {
        return axios.get(COMPANIES_LIST_UNDER_ENTITY_URL.replace("{entityUuid}", entityUuid));
    }

    createCompany(company) {
        return axios.post(CREATE_COMPANY_URL, company);
    }

    getCompany(guid) {
        return axios.get(GET_COMPANY_URL + guid);
    }

    updateCompany(company) {
        return axios.post(UPDATE_COMPANY_URL, company);
    }

    deactivateCompany(uuid) {
        return axios.put(`${DEACTIVATE_COMPANY_URL}/${uuid}`);
    }

    reactivateCompany(uuid) {
        return axios.put(`${REACTIVATE_COMPANY_URL}/${uuid}`);
    }
}

export default new CompaniesService();
