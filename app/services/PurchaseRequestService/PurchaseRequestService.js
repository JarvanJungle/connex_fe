import axios from "axios";
import URL_PURCHASE_REQUEST from "./url";

class PurchaseRequestService {
    getListPurchaseRequisition(companyUuid) {
        const url = URL_PURCHASE_REQUEST.GET_LIST_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    createPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.CREATE_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getDetailsPurchaseRequisition(companyUuid, purchaseUuid) {
        const url = URL_PURCHASE_REQUEST.GET_DETAILS_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid)
            .replace("{purchaseUuid}", purchaseUuid);
        return axios.get(url);
    }

    getDetailsPurchaseRequisitionOverview(companyUuid, purchaseUuid, child = false) {
        const url = URL_PURCHASE_REQUEST.GET_DETAILS_PURCHASE_REQUISITION_OVERVIEW_URL.replace("{companyUuid}", companyUuid)
            .replace("{purchaseUuid}", purchaseUuid).replace("{child}", child);
        return axios.get(url);
    }

    cancelPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.CANCEL_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    recallPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.RECALL_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    rejectPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.REJECT_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    approvePurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.APPROVE_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    editPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.EDIT_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    editDraftPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.EDIT_DRAFT_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    sendBackPurchaseRequisition(companyUuid, body) {
        const url = URL_PURCHASE_REQUEST.SEND_BACK_PURCHASE_REQUISITION_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    convertPPR2PR(companyUuid, pprUuid) {
        const url = URL_PURCHASE_REQUEST.CONVERT_PPR_TO_PR_URL.replace("{companyUuid}", companyUuid)
            .replace("{pprUuid}", pprUuid);
        return axios.post(url);
    }

    sendBackPPR(companyUuid, pprUuid, body) {
        const url = URL_PURCHASE_REQUEST.SEND_BACK_PPR_URL.replace("{companyUuid}", companyUuid)
            .replace("{pprUuid}", pprUuid);
        return axios.post(url, body);
    }
}

export default new PurchaseRequestService();
