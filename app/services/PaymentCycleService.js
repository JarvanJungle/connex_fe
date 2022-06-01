import axios from "axios";
import CONFIG from "./urlConfig";

class PaymentCycleService {
    getPaymentCycleList(companyUuid) {
        const url = CONFIG.LIST_OF_PAYMENT_CYCLES.replace("{companyUuid}", companyUuid);
        return axios.get(url).then((res) => res.data);
    }

    getPaymentCycleDetails(companyUuid, paymentCycleUuid) {
        const url = CONFIG.GET_PAYMENT_CYCLE_DETAILS
            .replace("{companyUuid}", companyUuid)
            .replace("{paymentCycleUuid}", paymentCycleUuid);
        return axios.get(url).then((res) => res.data);
    }

    massUploadPaymentCycle(companyUuid, payload) {
        const url = CONFIG.MASS_UPLOAD_PAYMENT_CYCLE.replace("{companyUuid}", companyUuid);
        return axios.post(url, payload);
    }

    createPaymentCycle(companyUuid, payload) {
        const url = CONFIG.CREATE_PAYMENT_CYCLE.replace("{companyUuid}", companyUuid);
        return axios.post(url, payload);
    }

    updatePaymentCycle(companyUuid, payload) {
        const url = CONFIG.UPDATE_PAYMENT_CYCLE.replace("{companyUuid}", companyUuid);
        return axios.post(url, payload);
    }

    activatePaymentCycle(companyUuid, payload) {
        const url = CONFIG.ACTIVATE_PAYMENT_CYCLE.replace("{companyUuid}", companyUuid);
        return axios.post(url, {
            active: true,
            uuids: payload
        });
    }

    deactivatePaymentCycle(companyUuid, payload) {
        const url = CONFIG.ACTIVATE_PAYMENT_CYCLE.replace("{companyUuid}", companyUuid);
        return axios.post(url, {
            active: false,
            uuids: payload
        });
    }
}

export default new PaymentCycleService();
