import axios from "axios";
import PRE_PURCHASE_ORDER_API from "./url";

class PrePurchaseOrderService {
    getPRToBeConvertedList(companyUuid) {
        const url = PRE_PURCHASE_ORDER_API.GET_LIST_PR_TO_BE_CONVERTED_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getPPOList(companyUuid) {
        const url = PRE_PURCHASE_ORDER_API.GET_LIST_PPO_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getPPODetails(companyUuid, ppoUuid) {
        const url = PRE_PURCHASE_ORDER_API.GET_PPO_DETAILS_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.get(url);
    }

    getPPOOverviewDetails(companyUuid, ppoUuid, child = false) {
        const url = PRE_PURCHASE_ORDER_API.GET_PPO_OVERVIEW_DETAILS_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid).replace("{child}", child);
        return axios.get(url);
    }

    approvePPO(companyUuid, ppoUuid, body) {
        const url = PRE_PURCHASE_ORDER_API.APPROVE_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url, body);
    }

    rejectPPO(companyUuid, ppoUuid, body) {
        const url = PRE_PURCHASE_ORDER_API.REJECT_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url, body);
    }

    recallPPO(companyUuid, ppoUuid) {
        const url = PRE_PURCHASE_ORDER_API.RECALL_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url);
    }

    sendBackPPO(companyUuid, ppoUuid, body) {
        const url = PRE_PURCHASE_ORDER_API.SEND_BACK_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url, body);
    }

    cancelPPO(companyUuid, ppoUuid) {
        const url = PRE_PURCHASE_ORDER_API.CANCEL_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url);
    }

    saveAsDraftPPO(companyUuid, ppoUuid, body) {
        const url = PRE_PURCHASE_ORDER_API.SAVE_AS_DRAFT_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url, body);
    }

    submitPPO(companyUuid, ppoUuid, body) {
        const url = PRE_PURCHASE_ORDER_API.SUBMIT_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url, body);
    }

    convertPR2PPO(companyUuid, prUuid, supplierUuid) {
        const url = PRE_PURCHASE_ORDER_API.CONVERT_PR_TO_PPO_URL.replace("{companyUuid}", companyUuid)
            .replace("{prUuid}", prUuid)
            .replace("{supplierUuid}", supplierUuid);
        return axios.post(url);
    }
}

export default new PrePurchaseOrderService();
