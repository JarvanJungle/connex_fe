import axios from "axios";
import MANAGE_ROLE_API from "./url";
import UserService from "services/UserService";

class ManageRolesService {
    // ====== Entity Admin ======

    getRolesList(companyUuid) {
        const url = MANAGE_ROLE_API.GET_LIST_ROLE_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getRoleDetails(companyUuid, roleUuid) {
        const url = MANAGE_ROLE_API.ROLE_DETAILS_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{roleUuid}", roleUuid);
        return axios.get(url);
    }

    createNewRole(companyUuid, body) {
        const url = MANAGE_ROLE_API.CREATE_ROLE_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    updateRole(companyUuid, roleUuid, body) {
        const url = MANAGE_ROLE_API.UPDATE_ROLE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{roleUuid}", roleUuid);
        return axios.put(url, body);
    }

    assignRoleToUser(companyUuid, userUuid, roleUuids) {
        const url = MANAGE_ROLE_API.ASSIGN_ROLE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{userUuid}", userUuid);
        return axios.post(url, roleUuids);
    }

    getRoleOfUser(companyUuid, userUuid) {
        const url = MANAGE_ROLE_API.GET_ROLE_OF_USER_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{userUuid}", userUuid);
        return axios.get(url);
    }

    // ====== Doxa Admin ======
    getDefaultRolesList() {
        const url = MANAGE_ROLE_API.DOXA_ADMIN_GET_LIST_ROLE_URL;
        return axios.get(url);
    }

    getDefaultRoleDetails(roleUuid) {
        const url = MANAGE_ROLE_API.DOXA_ADMIN_ROLE_DETAILS_URL
            .replace("{roleUuid}", roleUuid);
        return axios.get(url);
    }

    createNewDefaultRole(body) {
        const url = MANAGE_ROLE_API.DOXA_ADMIN_CREATE_ROLE_URL;
        return axios.post(url, body);
    }

    updateDefaultRole(roleUuid, body) {
        const url = MANAGE_ROLE_API.DOXA_ADMIN_UPDATE_ROLE_URL
            .replace("{roleUuid}", roleUuid);
        return axios.put(url, body);
    }

    deleteRole(roleUuid) {
        const url = MANAGE_ROLE_API.DOXA_ADMIN_DELETE_ROLE_URL
            .replace("{roleUuid}", roleUuid)
            .replace("{companyUuid}", UserService.getCurrentCompanyUuid());
        return axios.delete(url);
    }
}

export default new ManageRolesService();
