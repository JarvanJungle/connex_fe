import axios from "axios";
import CONFIG from "./urlConfig";

const { LIST_ALL_FEATURES } = CONFIG;
const { LIST_ALL_CATEGORIES } = CONFIG;
const { USER_ACCESS_MATRIX } = CONFIG;
const { PERMISSIONS_OF_AN_USER } = CONFIG;
const { GET_RESOURCES_UNDER_COMPANY } = CONFIG;

class PrivilegesService {
    getListAllFeatures() {
        return axios.get(LIST_ALL_FEATURES);
    }

    getListAllCategories() {
        return axios.get(LIST_ALL_CATEGORIES);
    }

    postUserAccessMatrix(companyUuid, body) {
        return axios.post(PERMISSIONS_OF_AN_USER.replace("{companyUuid}", companyUuid).replace("{userUuid}"), body);
    }

    getPermissionsOfAnUser(companyUuid, userUuid) {
        return axios.get(PERMISSIONS_OF_AN_USER.replace("{companyUuid}", companyUuid).replace("{userUuid}", userUuid));
    }

    getResourcesUnderCompany(companyUuid) {
        return axios.get(GET_RESOURCES_UNDER_COMPANY.replace("{companyUuid}", companyUuid));
    }
}

export default new PrivilegesService();
