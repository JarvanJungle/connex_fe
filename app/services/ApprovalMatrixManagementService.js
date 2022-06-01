import axios from "axios";
import CONFIG from "services/urlConfig";

class ApprovalMatrixManagementService {
    /**
     *
     * @param {*} companyUuid
     * @returns
     */
    getAllApprovalMatrixList(companyUuid) {
        return axios.get(CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.ALL_APPROVAL_MATRIX_URL.replace("{companyUuid}", companyUuid));
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} approvalUuid
     * @returns
     */
    getApprovalMatrixByApprovalUuid(companyUuid, approvalUuid) {
        let urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.APPROVAL_MATRIX_DETAIL_URL.replace("{companyUuid}", companyUuid);
        urlPath = urlPath.replace("{approvalUuid}", approvalUuid);
        return axios.get(urlPath);
    }

    putActiveApprovalMatrix(companyUuid, approvalUuid) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.ACTIVATE_APPROVAL_MATRIX_URL.replace("{companyUuid}", companyUuid).replace("{approvalUuid}", approvalUuid);
        return axios.put(urlPath);
    }

    putDeActiveApprovalMatrix(companyUuid, approvalUuid) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.DEACTIVATE_APPROVAL_MATRIX_URL.replace("{companyUuid}", companyUuid).replace("{approvalUuid}", approvalUuid);
        return axios.put(urlPath);
    }

    createApprovalMatrix(companyUuid, data) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.CREATE_APPROVAL_MATRIX_URL.replace("{companyUuid}", companyUuid);
        return axios.post(urlPath, data);
    }

    updateApprovalMatrix(companyUuid, data) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.UPDATE_APPROVAL_MATRIX_URL.replace("{companyUuid}", companyUuid);
        return axios.put(urlPath, data);
    }

    retrieveListOfApprovalMatrixDetails(companyUuid, featureCode) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.RETRIEVE_LIST_OF_APPROVAL_MATRIX_DETAILS.replace("{companyUuid}", companyUuid);
        return axios.post(urlPath, { companyUuid, featureCode });
    }

    getListFeature(companyUuid) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.FEATURE_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(urlPath);
    }

    getListApprovalMatrixFeature(companyUuid, body) {
        const urlPath = CONFIG.APPROVAL_MATRIX_MANAGEMENT_API.APPROVAL_MATRIX_FEATURE_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.post(urlPath, body);
    }
}

export default new ApprovalMatrixManagementService();
