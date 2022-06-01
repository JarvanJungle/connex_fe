import axios from "axios";
import CONFIG from "./urlConfig";

class PaymentTermService {
    getAllPaymentTerms(companyUuid) {
        const url = CONFIG.LIST_PAYMENT_TERM_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getPaymentTermByUuid(companyUuid, ptUuid) {
        const url = CONFIG.GET_DETAILS_PAYMENT_TERM_URL.replace("{companyUuid}", companyUuid).replace("{ptUuid}", ptUuid);
        return axios.get(url);
    }

    createPaymentTerm(companyUuid, { ptName, ptDays, ptRemarks }) {
        const data = {
            ptName,
            ptDays,
            ptRemarks
        };
        const url = CONFIG.CREATE_PAYMENT_TERM_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, data);
    }

    updatePaymentTerm(companyUuid, { ptUuid, ptRemarks }) {
        const data = {
            ptUuid,
            ptRemarks
        };
        const url = CONFIG.UPDATE_PAYMENT_TERM_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, data);
    }
}

export default new PaymentTermService();
