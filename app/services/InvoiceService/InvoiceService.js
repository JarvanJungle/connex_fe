import axios from "axios";
import { INVOICE_CONSTANTS } from "routes/P2P/Invoice/helper";
import INVOICE_API from "./url";

class InvoiceService {
    getInvList(companyUuid, isBuyer) {
        let url = isBuyer
            ? INVOICE_API.GET_LIST_INV_BUYER_URL
            : INVOICE_API.GET_LIST_INV_SUPPLIER_URL;
        url = url.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getInvoicePendingApprovalList(companyUuid) {
        let url = INVOICE_API.GET_LIST_INV_PENDING_AP_URL;
        url = url.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getDOListForCreatingINV(companyUuid, uuid) {
        const url = INVOICE_API.GET_LIST_DO_FOR_CREATING_INV_SUPPLIER_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{buyerCompanyUuid}", uuid);
        return axios.get(url);
    }

    getPOListForCreatingINV(companyUuid, uuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.GET_LIST_PO_FOR_CREATING_INV_BUYER_URL
                .replace("{companyUuid}", companyUuid)
                .replace("{buyerUuid}", uuid);
        } else {
            url = INVOICE_API.GET_LIST_PO_FOR_CREATING_INV_SUPPLIER_URL
                .replace("{companyUuid}", companyUuid)
                .replace("{buyerCompanyUuid}", uuid);
        }
        return axios.get(url);
    }

    createINV(companyUuid, vendorUuid, body, type, isBuyer) {
        let url = "";
        if (type === INVOICE_CONSTANTS.NON_PO) {
            if (isBuyer) {
                url = INVOICE_API.CREATE_INV_NON_PROJECT_BUYER_URL.replace("{companyUuid}", companyUuid)
                    .replace("{supplierUuid}", vendorUuid);
            } else {
                url = INVOICE_API.CREATE_INV_NON_PROJECT_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                    .replace("{buyerCompanyUuid}", vendorUuid);
            }
        } else if (type === INVOICE_CONSTANTS.PO) {
            if (isBuyer) {
                url = INVOICE_API.CREATE_INV_PROJECT_BUYER_URL.replace("{companyUuid}", companyUuid)
                    .replace("{supplierUuid}", vendorUuid);
            } else {
                url = INVOICE_API.CREATE_INV_PROJECT_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                    .replace("{buyerCompanyUuid}", vendorUuid);
            }
        } else {
            url = INVOICE_API.CREATE_INV_DO_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{buyerCompanyUuid}", vendorUuid);
        }
        return axios.post(url, body);
    }

    getPODetailsForCreatingInv(companyUuid, body) {
        const url = INVOICE_API.GET_PO_DETAILS_FOR_CREATING_INV_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getDODetailsForCreatingInv(companyUuid, body) {
        const url = INVOICE_API.GET_DO_DETAILS_FOR_CREATING_INV_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getInvDetails(companyUuid, invoiceUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.GET_INV_DETAILS_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        } else {
            url = INVOICE_API.GET_INV_DETAILS_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        }
        return axios.get(url);
    }

    getInvOverviewDetails(companyUuid, invoiceUuid, isBuyer, child = false) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.GET_INV_OVERVIEW_DETAILS_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid).replace("{child}", child);
        } else {
            url = INVOICE_API.GET_INV_OVERVIEW_DETAILS_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid).replace("{child}", child);
        }
        return axios.get(url);
    }

    getInvPendingAPDetails(companyUuid, invoiceUuid) {
        const url = INVOICE_API.GET_INV_PENDING_AP_DETAILS_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.get(url);
    }

    issueInvPendingAP(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.ISSUE_INV_PENDING_AP_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }

    approveInvoicePendingAP(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.APPROVE_INVOICE_PENDING_AP_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }

    rejectInvoicePendingAP(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.REJECT_INVOICE_PENDING_AP_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }

    rejectInvoice(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.REJECT_INVOICE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }

    reissueInvoice(companyUuid, vendorUuid, invoiceUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.REISSUE_INV_PROJECT_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{supplierUuid}", vendorUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        } else {
            url = INVOICE_API.REISSUE_INV_PROJECT_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{buyerCompanyUuid}", vendorUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        }
        return axios.post(url);
    }

    createOPCInvoice(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.CREATE_OPC_INVOICE_SUPPLIER_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }

    getOPCInvoiceDetail(companyUuid, invoiceUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.GET_OPC_INVOICE_DETAIL_BUYER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        } else {
            url = INVOICE_API.GET_OPC_INVOICE_DETAIL_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        }
        return axios.get(url);
    }

    getOPCInvoiceLIST(companyUuid, isBuyer) {
        let url = isBuyer
            ? INVOICE_API.GET_LIST_OPC_INVOICE_BUYER_URL
            : INVOICE_API.GET_LIST_OPC_INVOICE_SUPPLIER_URL;
        url = url.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getOPCInvoicePendingApprovalList(companyUuid) {
        // let url = isBuyer
        //     ? INVOICE_API.GET_LIST_OPC_INVOICE_BUYER_URL
        //     : INVOICE_API.GET_LIST_OPC_INVOICE_SUPPLIER_URL;
        const url = INVOICE_API.GET_LIST_OPC_INVOICE_PENDING_APPROVAL_BUYER_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    viewPDF(companyUuid, invoiceUuid, isBuyer) {
        let url = "";
        if (isBuyer) {
            url = INVOICE_API.VIEW_PDF_INVOICE_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        } else {
            url = INVOICE_API.VIEW_PDF_INVOICE_SUPPLIER_URL.replace("{companyUuid}", companyUuid)
                .replace("{invoiceUuid}", invoiceUuid);
        }
        return axios.get(url);
    }

    approveOpc(companyUuid, invoiceUuid) {
        const url = INVOICE_API.OPC_APPROVE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url);
    }

    approveInvoiceOpc(companyUuid, invoiceUuid, body) {
        const url = INVOICE_API.OPC_APPROVE_INVOICE_PENDING_AP_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{invoiceUuid}", invoiceUuid);
        return axios.put(url, body);
    }
}

export default new InvoiceService();
