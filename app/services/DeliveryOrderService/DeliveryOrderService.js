import axios from "axios";
import DO_API from "./url";

class DeliveryOrderService {
    getListDeliveryOrder(companyUuid) {
        const url = DO_API.DELIVERY_ORDER_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getDeliveryOrderPOList(companyUuid) {
        const url = DO_API.DELIVERY_ORDER_PO_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getDeliveryOrderDetails(companyUuid, doUuid) {
        const url = DO_API.DELIVERY_ORDER_DETAILS.replace("{companyUuid}", companyUuid).replace("{doUuid}", doUuid);
        return axios.get(url);
    }

    getDOOverview(companyUuid, doUuid, child = false) {
        const url = DO_API.DELIVERY_ORDER_OVERVIEW.replace("{companyUuid}", companyUuid).replace("{doUuid}", doUuid).replace("{child}", child);
        return axios.get(url);
    }

    getCreateDeliveryOrderDetails(companyUuid, body) {
        const url = DO_API.DELIVERY_ORDER_CREATE_DETAILS.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    createNewDeliveryOrder(companyUuid, body) {
        const url = DO_API.DELIVERY_ORDER_CREATE_NEW.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    issueDeliveryOrder(companyUuid, body) {
        const url = DO_API.DELIVERY_ORDER_ISSUE.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    viewPDF(companyUuid, doUuid) {
        const url = DO_API.DELIVERY_ORDER_VIEW_PDF_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", doUuid);
        return axios.get(url);
    }

    viewPDFBuyer(companyUuid, doUuid) {
        const url = DO_API.DELIVERY_ORDER_VIEW_PDF_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", doUuid);
        return axios.get(url);
    }
    viewPDFSupplier(companyUuid, doUuid) {
        const url = DO_API.DELIVERY_ORDER_VIEW_PDF_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", doUuid);
        return axios.get(url);
    }
}

export default new DeliveryOrderService();
