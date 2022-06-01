import axios from "axios";
import RFQ_URLS from "./url";

class RequestForQuotationService {
    getRFQsList(companyUuid, isBuyer) {
        let url = isBuyer ? RFQ_URLS.RFQS_LIST_BUYER_URL : RFQ_URLS.RFQS_LIST_SUPPLIER_URL;
        url = url.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    saveAsDraftRFQ(companyUuid, body) {
        const url = RFQ_URLS.SAVE_AS_DRAFT_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    submitRFQ(companyUuid, body) {
        const url = RFQ_URLS.SUBMIT_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getRFQDetails(companyUuid, rfqUuid, isBuyer) {
        let url = isBuyer ? RFQ_URLS.DETAILS_RFQ_BUYER_URL : RFQ_URLS.DETAILS_RFQ_SUPPLIER_URL;
        url = url.replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid);
        return axios.get(url);
    }

    closeRFQ(companyUuid, body) {
        const url = RFQ_URLS.CLOSE_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    cancelRFQ(companyUuid, rfqUuid) {
        const url = RFQ_URLS.CANCEL_RFQ_URL.replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid);
        return axios.put(url);
    }

    editRFQ(companyUuid, rfqUuid, body) {
        const url = RFQ_URLS.EDIT_RFQ_URL.replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid);
        return axios.post(url, body);
    }

    submitQuote(companyUuid, body) {
        const url = RFQ_URLS.SUBMIT_QUOTE_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    updateQuote(companyUuid, body) {
        const url = RFQ_URLS.UPDATE_QUOTE_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    shortlistRFQ(companyUuid, body) {
        const url = RFQ_URLS.SHORTLIST_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    recallRFQ(companyUuid, body) {
        const url = RFQ_URLS.RECALL_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    sendBackRFQ(companyUuid, body) {
        const url = RFQ_URLS.SEND_BACK_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    approveRFQ(companyUuid, body) {
        const url = RFQ_URLS.APPROVE_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    buyerSendNegotiation(companyUuid, rfqUuid, body) {
        const url = RFQ_URLS.BUYER_SEND_NEGOTIATION_URL.replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid);
        return axios.post(url, body);
    }

    supplierSendNegotiation(companyUuid, rfqUuid, body) {
        const url = RFQ_URLS.SUPPLIER_SEND_NEGOTIATION_URL.replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid);
        return axios.post(url, body);
    }

    unconnectedSupplierGetRFQDetails(token) {
        const url = RFQ_URLS.DETAILS_RFQ_UNCONNECTED_SUPPLIER_URL.replace("{token}", token);
        return axios.get(url);
    }

    unconnectedSupplierSubmitQuote(token, body) {
        const url = RFQ_URLS.UNCONNECTED_SUPPLIER_SUBMIT_URL.replace("{token}", token);
        return axios.post(url, body);
    }

    convertRFQToPO(companyUuid, rfqUuid, supplierUuid, rfqType, documents) {
        let url;
        if (rfqType === "Contract") {
            url = RFQ_URLS.CONVERT_RFQ_TO_CONTRACT_URL
                .replace("{companyUuid}", companyUuid)
                .replace("{rfqUuid}", rfqUuid)
                .replace("{supplierUuid}", supplierUuid);
        } else {
            url = RFQ_URLS.CONVERT_RFQ_TO_PO_URL
                .replace("{companyUuid}", companyUuid)
                .replace("{rfqUuid}", rfqUuid)
                .replace("{supplierUuid}", supplierUuid);
        }
        return axios.post(url, documents);
    }

    convertRFQToContract(companyUuid, rfqUuid, supplierUuid) {
        const url = RFQ_URLS.CONVERT_RFQ_TO_CONTRACT_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{rfqUuid}", rfqUuid)
            .replace("{supplierUuid}", supplierUuid);
        return axios.post(url);
    }

    reopenRFQ(companyUuid, body) {
        const url = RFQ_URLS.REOPEN_RFQ_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    getRFQOverview(companyUuid, rfqUuid, child) {
        const url = RFQ_URLS.RFQ_OVERVIEW.replace("{companyUuid}", companyUuid).replace("{rfqUuid}", rfqUuid).replace("{child}", child);
        return axios.get(url);
    }
}

export default new RequestForQuotationService();
