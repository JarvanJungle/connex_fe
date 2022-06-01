import axios from "axios";
import CONFIG from "./urlConfig";

class SupplierDataService {
    retrieveAllSuppliersUnderCompany(companyUuid) {
        return axios.get(CONFIG.GET_RETRIEVE_ALL_SUPPLIERS_UNDER_COMPANY.replace("{companyUuid}", companyUuid));
    }

    retrieveSuppliersDetails(companyUuid, supplierUuid) {
        return axios.get(CONFIG.GET_RETRIEVE_SUPPLIERS_DETAILS.replace("{companyUuid}", companyUuid).replace("{supplierUuid}", supplierUuid));
    }
}

export default new SupplierDataService();
