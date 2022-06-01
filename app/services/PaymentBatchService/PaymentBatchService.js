import axios from "axios";
import PAYMENT_BATCH_API from "./url";

class PaymentBatchService {
    getApprovedPaymentList(companyUuid) {
        const url = PAYMENT_BATCH_API.GET_APPROVED_PAYMENT_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getDetailsPaymentForCreatingPaymentBatch(companyUuid, body) {
        const url = PAYMENT_BATCH_API.DETAILS_PAYMENT_FOR_CREATING_PAYMENT_BATCH_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    createPaymentBatch(companyUuid, body) {
        const url = PAYMENT_BATCH_API.CREATE_PAYMENT_BATCH_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getPaymentBatchList(companyUuid) {
        const url = PAYMENT_BATCH_API.GET_PAYMENT_BATCH_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getIntegrationProduct(companyUuid, bankAccountUuid) {
        const url = PAYMENT_BATCH_API.GET_INTEGRATION_PRODUCT_URL.replace("{companyUuid}", companyUuid).replace("{bankAccountUuid}", bankAccountUuid);
        return axios.get(url);
    }

    getDetailsPaymentBatch(companyUuid, paymentUuid) {
        const url = PAYMENT_BATCH_API.DETAILS_PAYMENT_BATCH_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{paymentUuid}", paymentUuid);
        return axios.get(url);
    }

    rejectPaymentBatch(companyUuid, paymentUuid) {
        const url = PAYMENT_BATCH_API.REJECT_PAYMENT_BATCH_URL.replace("{companyUuid}", companyUuid).replace("{paymentUuid}", paymentUuid);
        return axios.post(url);
    }

    getPaymentBatchOverview(companyUuid, paymentUuid) {
        const url = PAYMENT_BATCH_API.PAYMENT_BATCH_OVERVIEW.replace("{companyUuid}", companyUuid).replace("{paymentUuid}", paymentUuid);
        return axios.get(url);
    }
}

export default new PaymentBatchService();
