import axios from "axios";
import AP_SPECIALIST_API from "./url";

class APSpecialistService {
    getListAPSpecialist(companyUuid) {
        const url = AP_SPECIALIST_API.GET_LIST_AP_SPECIALIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    createAPSpecialist(companyUuid, body) {
        const url = AP_SPECIALIST_API.CREATE_AP_SPECIALIST_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getAPSpecialistDetails(companyUuid, apSpecialistUuid) {
        const url = AP_SPECIALIST_API.GET_AP_SPECIALIST_DETAILS_URL.replace("{companyUuid}", companyUuid)
            .replace("{apSpecialistUuid}", apSpecialistUuid);
        return axios.get(url);
    }

    editAPSpecialist(companyUuid, body) {
        const url = AP_SPECIALIST_API.EDIT_AP_SPECIALIST_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    postMassUploadAPSpecialList(companyUuid, body) {
        const url = AP_SPECIALIST_API.MASS_UPLOAD_AP_SPECIAL_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }
}

export default new APSpecialistService();
