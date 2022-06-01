import axios from "axios";
import urls from "./urls";
import { DPC_STATUS } from "../../routes/Entities/ProgressiveClaims/DraftProgressiveClaimList/Helper";

class DraftProgressiveClaimService {
    getClaimList(supplierCompanyUuid) {
        const apiURL = urls.DRAFT_CLAIM_LIST
            .replace("{supplierCompanyUuid}", supplierCompanyUuid);
        return axios.get(apiURL);
    }

    getClaimMcList(supplierCompanyUuid, isBuyer) {
        let apiURL = urls.DRAFT_CLAIM_MC_LIST_SUPPLIER
            .replace("{supplierCompanyUuid}", supplierCompanyUuid);
        if (isBuyer) {
            apiURL = urls.DRAFT_CLAIM_MC_LIST_BUYER
                .replace("{buyerCompanyUuid}", supplierCompanyUuid);
        }

        return axios.get(apiURL);
    }

    createDraftClaim(supplierCompanyUuid, dwoUuid) {
        const apiURL = urls.DRAFT_CLAIM_CREATE
            .replace("{supplierCompanyUuid}", supplierCompanyUuid)
            .replace("{dwoUuid}", dwoUuid);
        return axios.post(apiURL);
    }

    getWorkingOrderDetail(supplierCompanyUuid, dwoUuid) {
        const apiUrl = urls.DRAFT_WORKING_ORDER_DETAIL
            .replace("{supplierCompanyUuid}", supplierCompanyUuid)
            .replace("{dwoUuid}", dwoUuid);
        return axios.get(apiUrl);
    }

    getDraftClaimDetail(supplierCompanyUuid, dpcUuid, isBuyer) {
        let apiUrl = urls.DRAFT_CLAIM_DETAIL_SUPPLIER;
        if (isBuyer) {
            apiUrl = urls.DRAFT_CLAIM_DETAIL_BUYER;
        }

        apiUrl = apiUrl.replace("{companyUuid}", supplierCompanyUuid)
            .replace("{dpcUuid}", dpcUuid);
        return axios.get(apiUrl);
    }

    updateDraftClaim(companyUuid, dpcUuid, action, body) {
        let url = null;
        let method = null;
        switch (action) {
        case DPC_STATUS.CREATED: {
            url = urls.DRAFT_CLAIM_ISSUE;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_ACKNOWLEDGEMENT: {
            url = urls.DRAFT_CLAIM_ACKNOWLEDGEMENT;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_VALUATION: {
            url = urls.DRAFT_CLAIM_SUBMIT;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_SUBMISSION: {
            url = urls.DRAFT_CLAIM_SAVE_AS_DRAFT;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_APPROVAL: {
            url = urls.DRAFT_CLAIM_APPROVE;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_REVERT: {
            url = urls.DRAFT_CLAIM_REVERT;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_ACKNOWLEDGE_DRAFT_VALUATION: {
            url = urls.DRAFT_CLAIM_ACKNOWLEDGEMENT_VALUATION;
            method = "put";
            break;
        }
        case DPC_STATUS.PENDING_OFFICIAL_CLAIMS_SUBMISSION: {
            url = urls.DRAFT_CLAIM_CONVERT_ACTUAL;
            method = "post";
            break;
        }
        }
        if (url) {
            url = url.replace("{companyUuid}", companyUuid)
                .replace("{dpcUuid}", dpcUuid);
            if (method) {
                if (method === "put") return axios.put(url, body);
                if (method === "post") return axios.post(url, body);
                if (method === "delete") return axios.delete(url, body);
            }
            return axios.get(url);
        }
        throw new Error("Action is not defined");
    }

    getListChildOriginalOrder(isBuyer, companyUuid, dpcUuid, itemParentUuid) {
        let url = "";
        if (isBuyer) {
            url = urls.DRAFT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER.replace("{companyUuid}", companyUuid).replace("{dpcUuid}", dpcUuid).replace("{itemParentUuid}", itemParentUuid);
        } else {
            url = urls.DRAFT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{dpcUuid}", dpcUuid).replace("{itemParentUuid}", itemParentUuid);
        }
        return axios.get(url);
    }
}

export default new DraftProgressiveClaimService();
