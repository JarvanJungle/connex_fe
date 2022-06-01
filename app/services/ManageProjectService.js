import axios from "axios";
import CONFIG from "services/urlConfig";

class ManageProjectService {
    /**
     *
     * @title Manage Projects - List projects for company
     * @param {*} companyUuid
     * @returns company project list
     */
    getCompanyProjectList(companyUuid) {
        return axios.get(CONFIG.MANAGE_PROJECT_API.COMPANY_PROJECT_LIST_URL.replace("{companyUuid}", companyUuid));
    }

    getProjectDetail(companyUuid, projectCode) {
        const url = CONFIG.PROJECT_DETAIL_URL.replace("{companyUuid}", companyUuid).replace("{projectCode}", projectCode);
        return axios.get(url);
    }
}

export default new ManageProjectService();
