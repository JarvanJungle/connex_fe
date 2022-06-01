import axios from "axios";
import GOODS_RECEIPT_API from "./url";

class GoodsReceiptService {
    getGRList(companyUuid) {
        const url = GOODS_RECEIPT_API.GET_LIST_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    createGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.CREATE_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    editGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.EDIT_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    grDetails(companyUuid, grUuid) {
        const url = GOODS_RECEIPT_API.DETAILS_GR_URL.replace("{companyUuid}", companyUuid)
            .replace("{grUuid}", grUuid).replace("{grGlobalNumber}", "");
        return axios.get(url);
    }

    grOverviewDetails(companyUuid, grUuid, child = false) {
        const url = GOODS_RECEIPT_API.DETAILS_GR_OVERVIEW_URL.replace("{companyUuid}", companyUuid)
            .replace("{grUuid}", grUuid).replace("{child}", child);
        return axios.get(url);
    }

    approveGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.APPROVE_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    rejectGR(companyUuid, grUuid, body) {
        const url = GOODS_RECEIPT_API.REJECT_GR_URL.replace("{companyUuid}", companyUuid)
            .replace("{grUuid}", grUuid);
        return axios.post(url, body);
    }

    getListDOForCreatingGR(companyUuid) {
        const url = GOODS_RECEIPT_API.GET_LIST_DO_FOR_CREATING_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getListPOForCreatingGR(companyUuid) {
        const url = GOODS_RECEIPT_API.GET_LIST_PO_FOR_CREATING_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    submitGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.SUBMIT_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getDetailsDOForCreatingGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.GET_DO_DETAILS_FOR_CREATING_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getDetailsPOForCreatingGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.GET_PO_DETAILS_FOR_CREATING_GR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    saveAsDraftGR(companyUuid, body) {
        const url = GOODS_RECEIPT_API.SAVE_AS_DRAFT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }
}

export default new GoodsReceiptService();
