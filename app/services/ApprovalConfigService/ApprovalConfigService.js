import axios from "axios";
import APPROVAL_CONFIG_API from "./url";

class ApprovalConfigService {
    getApprovalConfigList(companyUuid) {
        const url = APPROVAL_CONFIG_API.GET_APPROVAL_CONFIG_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    updateApprovalConfig(companyUuid, body) {
        const url = APPROVAL_CONFIG_API.UPDATE_APPROVAL_CONFIG_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    checkApprovalConfigByFeature(companyUuid, featureCode) {
        const url = APPROVAL_CONFIG_API.CHECK_APPROVAL_CONFIG_BY_FEATURE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{featureCode}", featureCode);
        return axios.get(url);
    }
}

export default new ApprovalConfigService();
