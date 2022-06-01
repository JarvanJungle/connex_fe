import axios from "axios";
import UserService from "services/UserService";
import CONFIG from "./urlConfig";

class ApprovalGroupService {
    getAllGroups(companyUuid, singleUserGroup = false) {
        const url = CONFIG.LIST_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url, {
            params: {
                singleUserGroup
            }
        });
    }

    getGroupByUuid(companyUuid, uuid) {
        const url = CONFIG.GET_DETAILS_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid).replace("{groupUuid}", uuid);
        return axios.get(url);
    }

    putActiveGroups(companyUuid, groupUuids) {
        const url = CONFIG.ACTIVATE_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, groupUuids);
    }

    putDeActiveGroups(companyUuid, groupUuids) {
        const url = CONFIG.DEACTIVATE_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, groupUuids);
    }

    createGroup(companyUuid, data = { groupName, groupDescription, groupUserList }) {
        const body = {
            ...data,
            companyUuid
        };
        const url = CONFIG.CREATE_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    updateGroup(companyUuid, data = {
        groupName, groupDescription, groupUserList, uuid
    }) {
        const url = CONFIG.UPDATE_APPROVAL_GROUP_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, data);
    }

    massUpload(payload) {
        const url = CONFIG.MASS_UPLOAD_APPROVAL_GROUP_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid());
        return axios.post(url, payload);
    }
}

export default new ApprovalGroupService();
