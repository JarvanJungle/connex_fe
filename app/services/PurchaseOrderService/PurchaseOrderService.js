import axios from "axios";
import PURCHASE_ORDER_API from "./url";

class PurchaseOrderService {
    getPOList(isBuyer, companyUuid) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.GET_LIST_PO_URL.replace("{companyUuid}", companyUuid);
        } else {
            url = PURCHASE_ORDER_API.GET_LIST_PO_SUPPLIER_URL.replace("{companyUuid}", companyUuid);
        }
        return axios.get(url);
    }

    convertPPO2PO(companyUuid, ppoUuid) {
        const url = PURCHASE_ORDER_API.CONVERT_PPO_TO_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{ppoUuid}", ppoUuid);
        return axios.post(url);
    }

    getDetailsPO(companyUuid, poUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.GET_DETAILS_PO_URL.replace("{companyUuid}", companyUuid)
                .replace("{poUuid}", poUuid);
        } else {
            url = PURCHASE_ORDER_API.GET_DETAILS_PO_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{poUuid}", poUuid);
        }
        return axios.get(url);
    }

    getDetailsPOOverview(companyUuid, poUuid, child = false) {
        const url = PURCHASE_ORDER_API.GET_DETAILS_PO_OVERVIEW_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid).replace("{child}", child);
        return axios.get(url);
    }

    issuePO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.ISSUE_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url, body);
    }

    cancelPO(companyUuid, poUuid) {
        const url = PURCHASE_ORDER_API.CANCEL_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url);
    }

    acknowledgePO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.ACKNOWLEDGE_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url, body);
    }

    rejectPO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.REJECT_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url, body);
    }

    closePO(companyUuid, poUuid) {
        const url = PURCHASE_ORDER_API.CLOSE_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url);
    }

    viewPDF(companyUuid, poUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.VIEW_PO_PDF_URL.replace("{companyUuid}", companyUuid)
                .replace("{poUuid}", poUuid);
        } else {
            url = PURCHASE_ORDER_API.VIEW_PO_PDF_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{poUuid}", poUuid);
        }
        return axios.get(url);
    }

    getWorkOrderList(isBuyer, companyUuid) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.GET_WORK_ORDER_LIST.replace("{companyUuid}", companyUuid);
        } else {
            url = PURCHASE_ORDER_API.GET_WORK_ORDER_LIST_BY_SUPPLIER.replace("{companyUuid}", companyUuid);
        }
        return axios.get(url);
    }

    getWorkOrderDetail(isBuyer, companyUuid, dwoUuid) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.GET_WORK_ORDER_DETAIL.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        } else {
            url = PURCHASE_ORDER_API.GET_WORK_ORDER_DETAIL_BY_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        }
        return axios.get(url);
    }

    recallWorkOrder(companyUuid, dwoUuid, body) {
        const url = PURCHASE_ORDER_API.RECALL_WO.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        return axios.put(url, body);
    }

    rejectWorkOrder(companyUuid, dwoUuid, body) {
        const url = PURCHASE_ORDER_API.RERJECT_WO.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        return axios.put(url, body);
    }

    issueWorkOrder(companyUuid, dwoUuid, body) {
        const url = PURCHASE_ORDER_API.ISSUE_WO.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        return axios.put(url, body);
    }

    cancelWorkOrder(companyUuid, dwoUuid, body) {
        const url = PURCHASE_ORDER_API.CANCEL_WO.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        return axios.put(url, body);
    }

    acknowledgeWorkOrder(companyUuid, dwoUuid, body) {
        const url = PURCHASE_ORDER_API.ACKNOWLEDGE_WO.replace("{companyUuid}", companyUuid).replace("{dwoUuid}", dwoUuid);
        return axios.put(url, body);
    }

    getListChildWorkSpace(isBuyer, companyUuid, dwrUuid, itemParentUuid) {
        let url = "";
        if (isBuyer) {
            url = PURCHASE_ORDER_API.GET_LIST_CHILD.replace("{companyUuid}", companyUuid).replace("{dwrUuid}", dwrUuid).replace("{itemParentUuid}", itemParentUuid);
        } else {
            url = PURCHASE_ORDER_API.GET_LIST_CHILD_BY_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{dwrUuid}", dwrUuid).replace("{itemParentUuid}", itemParentUuid);
        }
        return axios.get(url);
    }

    convertPR2PO(companyUuid, prUuid, supplierUuid) {
        const url = PURCHASE_ORDER_API.CONVERT_PR_TO_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{prUuid}", prUuid)
            .replace("{supplierUuid}", supplierUuid);
        return axios.post(url);
    }

    convertPPR2PO(companyUuid, pprUuid, supplierUuid) {
        const url = PURCHASE_ORDER_API.CONVERT_PPR_TO_PO_URL.replace("{companyUuid}", companyUuid)
            .replace("{pprUuid}", pprUuid)
            .replace("{supplierUuid}", supplierUuid);
        return axios.post(url);
    }

    submitPO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.SUBMIT_PO_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.put(url, body);
    }

    sendBackPO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.SEND_BACK_PO_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.post(url, body);
    }

    recallPO(companyUuid, poUuid) {
        const url = PURCHASE_ORDER_API.RECALL_PO_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.post(url);
    }

    approvePO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.APPROVE_PO_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.post(url, body);
    }

    buyerRejectPO(companyUuid, poUuid, body) {
        const url = PURCHASE_ORDER_API.BUYER_REJECT_PO_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{poUuid}", poUuid);
        return axios.post(url, body);
    }

    getPPRToBeConvertedList(companyUuid) {
        const url = PURCHASE_ORDER_API.GET_LIST_PPR_TO_BE_CONVERTED_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url);
    }
}

export default new PurchaseOrderService();
