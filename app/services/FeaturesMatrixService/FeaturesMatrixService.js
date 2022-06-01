import axios from "axios";
import FEATURES_MATRIX_API from "./api";

class FeaturesMatrixService {
    getUserAuthorities(companyUuid, userUuid) {
        const url = FEATURES_MATRIX_API.GET_USER_AUTHORITIES.replace("{companyUuid}", companyUuid).replace("{userUuid}", userUuid);
        return axios.get(url);
    }

    grantUserAuthorities(companyUuid, userUuid, data) {
        const url = FEATURES_MATRIX_API.GRANT_USER_AUTHORITIES.replace("{companyUuid}", companyUuid)
            .replace("{userUuid}", userUuid);
        return axios.post(url, data);
    }

    getCompanyAuthorities(companyUuid) {
        const url = FEATURES_MATRIX_API.GET_COMPANY_AUTHORITIE.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getListModule(companyUuid) {
        const url = FEATURES_MATRIX_API.GET_LIST_MODULE.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }
}

export default new FeaturesMatrixService();
