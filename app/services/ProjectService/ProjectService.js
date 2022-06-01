import axios from "axios";
import URL_MANAGE_PROJECT from "./url";
import UserService from "../UserService";

class ProjectService {
    createNewProject(body) {
        const url = URL_MANAGE_PROJECT.CREATE_PROJECT_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid());
        return axios.post(url, body);
    }

    getProjectDetails(projectCode) {
        const url = URL_MANAGE_PROJECT.PROJECT_DETAILS_URL
            .replace("{companyUuid}", UserService.getCurrentCompanyUuid())
            .replace("{projectCode}", projectCode);
        return axios.get(url);
    }

    updateProjectDetails(body) {
        const url = URL_MANAGE_PROJECT.UPDATE_PROJECT_URL
            .replace("{companyUuid}", UserService.getCurrentCompanyUuid());
        return axios.post(url, body);
    }
}

export default new ProjectService();
