import axios from "axios";
import CREDIT_NOTE_API from "./url";

class CreditNoteService {
    getCNList(companyUuid, isBuyer) {
        let url = isBuyer
            ? CREDIT_NOTE_API.GET_LIST_CN_BUYER_URL
            : CREDIT_NOTE_API.GET_LIST_CN_SUPPLIER_URL;
        url = url.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getListInvForCreatingCN(companyUuid, vendorUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = CREDIT_NOTE_API.GET_LIST_INV_FOR_CREATING_CN_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{supplierUuid}", vendorUuid);
        } else {
            url = CREDIT_NOTE_API.GET_LIST_INV_FOR_CREATING_CN_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{buyerCompanyUuid}", vendorUuid);
        }
        return axios.get(url);
    }

    getDetailsInvForCreatingCN(companyUuid, invoiceUuid) {
        const url = CREDIT_NOTE_API.GET_DETAILS_INV_FOR_CREATING_CN_URL.replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.get(url);
    }

    createCN(companyUuid, vendorUuid, body, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = CREDIT_NOTE_API.CREATE_CN_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{supplierUuid}", vendorUuid);
        } else {
            url = CREDIT_NOTE_API.CREATE_CN_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{buyerCompanyUuid}", vendorUuid);
        }
        return axios.post(url, body);
    }

    getDetailsCN(companyUuid, cnUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = CREDIT_NOTE_API.GET_DETAILS_CN_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{cnUuid}", cnUuid);
        } else {
            url = CREDIT_NOTE_API.GET_DETAILS_CN_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{cnUuid}", cnUuid);
        }
        return axios.get(url);
    }

    approveCN(companyUuid, body) {
        const url = CREDIT_NOTE_API.APPROVE_CN_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    rejectCN(companyUuid, body) {
        const url = CREDIT_NOTE_API.REJECT_CN_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    approveCNPending(companyUuid, body) {
        const url = CREDIT_NOTE_API.APPROVE_CN_PENDING_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    rejectCNPending(companyUuid, body) {
        const url = CREDIT_NOTE_API.REJECT_CN_PENDING_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }

    viewPDF(companyUuid, cnUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = CREDIT_NOTE_API.VIEW_CN_PDF_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{cnUuid}", cnUuid);
        } else {
            url = CREDIT_NOTE_API.VIEW_CN_PDF_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{cnUuid}", cnUuid);
        }
        return axios.get(url);
    }
}

export default new CreditNoteService();
