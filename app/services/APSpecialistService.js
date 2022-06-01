import axios from "axios";
import CONFIG from "./urlConfig";

class APSpecialistService {
    getAllAPSpecialist(companyUuid) {
        const url = CONFIG.LIST_AP_SPECIALIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }
}

export default new APSpecialistService();
