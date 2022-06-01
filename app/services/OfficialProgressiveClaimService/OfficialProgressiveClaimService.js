import axios from "axios";
import {
    PC_ACTION,
    ACE_ACTION,
} from "routes/Entities/ProgressiveClaims/OfficialProgressiveClaim/Helper";
import urls from "./urls";

class OfficialProgressiveClaimService {
    getClaimList(supplierCompanyUuid) {
        const apiURL = urls.DEVELOPER_CLAIM_LIST.replace(
            "{supplierCompanyUuid}",
            supplierCompanyUuid
        );
        return axios.get(apiURL);
    }

    createClaim(supplierCompanyUuid, dwoUuid) {
        const apiURL = urls.DEVELOPER_CLAIM_CREATE.replace(
            "{supplierCompanyUuid}",
            supplierCompanyUuid
        ).replace("{dwoUuid}", dwoUuid);
        return axios.post(apiURL);
    }

    getClaimMcList(supplierCompanyUuid, isBuyer) {
        let apiURL = urls.OFFICIAL_CLAIM_MC_LIST_SUPPLIER.replace(
            "{supplierCompanyUuid}",
            supplierCompanyUuid
        );
        if (isBuyer) {
            apiURL = urls.OFFICIAL_CLAIM_MC_LIST_BUYER.replace(
                "{buyerCompanyUuid}",
                supplierCompanyUuid
            );
        }

        return axios.get(apiURL);
    }

    getArchitectClaimMcList(companyUuid, isBuyer) {
        let apiURL = urls.ARCHITECT_OFFICIAL_CLAIM_MC_LIST_SUPPLIER.replace(
            "{supplierCompanyUuid}",
            companyUuid
        );
        if (isBuyer) {
            apiURL = urls.ARCHITECT_OFFICIAL_CLAIM_MC_LIST_BUYER.replace(
                "{buyerCompanyUuid}",
                companyUuid
            );
        }

        return axios.get(apiURL);
    }

    getArchitectProgressiveClaimDetail(companyUuid, uuid, isBuyer) {
        let apiUrl = urls.ARCHITECT_CLAIM_DETAIL_SUPPLIER;
        if (isBuyer) {
            apiUrl = urls.ARCHITECT_CLAIM_DETAIL_BUYER;
        }

        apiUrl = apiUrl.replace("{companyUuid}", companyUuid)
            .replace("{pcUuid}", uuid);
        return axios.get(apiUrl);
    }

    getProgressiveClaimDetail(companyUuid, uuid, isBuyer) {
        let apiUrl = urls.OFFICIAL_CLAIM_DETAIL_SUPPLIER;
        if (isBuyer) {
            apiUrl = urls.OFFICIAL_CLAIM_DETAIL_BUYER;
        }

        apiUrl = apiUrl.replace("{companyUuid}", companyUuid)
            .replace("{pcUuid}", uuid);
        return axios.get(apiUrl);
    }

    getWorkingOrderDetail(supplierCompanyUuid, dwoUuid) {
        const apiUrl = urls.OFFICIAL_CLAIM_WO_DETAILS
            .replace("{companyUuid}", supplierCompanyUuid)
            .replace("{dwoUuid}", dwoUuid);
        return axios.get(apiUrl);
    }

    createDraftClaim(supplierCompanyUuid, dwoUuid) {
        const apiURL = urls.DRAFT_CLAIM_CREATE
            .replace("{supplierCompanyUuid}", supplierCompanyUuid)
            .replace("{dwoUuid}", dwoUuid);
        return axios.post(apiURL);
    }

    updateOfficialClaim(companyUuid, pcUuid, action, body) {
        let url = null;
        let method = null;
        switch (action) {
        case PC_ACTION.ISSUED_DEVELOPER_PROGRESS_CLAIM: {
            url = urls.OFFICIAL_CLAIM_ISSUE;
            method = "put";
            break;
        }
        case ACE_ACTION.ISSUED_ARCHITECT_CERTIFICATE_TO_MAIN_CONTRACTOR: {
            url = urls.ARCHITECT_ISSUE_AC_TO_MC;
            method = "put";
            break;
        }
        case PC_ACTION.ACKNOWLEDGED_OFFICIAL_PROGRESS_CLAIM: {
            url = urls.OFFICIAL_CLAIM_ACKNOWLEDGEMENT;
            method = "put";
            break;
        }
        case ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_ARCHITECT: {
            url = urls.ARCHITECT_ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_ARCHITECT;
            method = "put";
            break;
        }
        case ACE_ACTION.ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_MC: {
            url = urls.ARCHITECT_ACKNOWLEDGED_ARCHITECT_CERTIFICATE_BY_MC;
            method = "put";
            break;
        }
        case PC_ACTION.SUBMITTED_VALUATED_DEVELOPER_PROGRESS_CLAIM: {
            url = urls.OFFICIAL_CLAIM_SUBMIT;
            method = "put";
            break;
        }
        case PC_ACTION.SAVED_DEVELOPER_PROGRESS_CLAIM_AS_DRAFT: {
            url = urls.OFFICIAL_CLAIM_SAVE_AS_DRAFT;
            method = "put";
            break;
        }
        case PC_ACTION.APPROVED_VALUATED_DEVELOPER_PROGRESS_CLAIM: {
            url = urls.OFFICIAL_CLAIM_APPROVE;
            method = "put";
            break;
        }
        case ACE_ACTION.APPROVED_ARCHITECT_CERTIFICATE: {
            url = urls.ARCHITECT_APPROVED_ARCHITECT_CERTIFICATE;
            method = "put";
            break;
        }
        case PC_ACTION.SUBMITTED_DEVELOPER_PROGRESS_CLAIM_TO_ARCHITECT: {
            url = urls.OFFICIAL_CLAIM_SUBMIT_TO_ARCHITECT;
            method = "put";
            break;
        }
        case ACE_ACTION.SUBMITTED_ARCHITECT_CERTIFICATE: {
            url = urls.ARCHITECT_SUBMIT;
            method = "put";
            break;
        }
        case ACE_ACTION.SENT_BACK_ARCHITECT_CERTIFICATE: {
            url = urls.ARCHITECT_SENT_BACK_ARCHITECT_CERTIFICATE_TO_ARCHITECT;
            method = "put";
            break;
        }
        case ACE_ACTION.SENT_BACK_ARCHITECT_CERTIFICATE_TO_MQS: {
            url = urls.ARCHITECT_SENT_BACK_ARCHITECT_CERTIFICATE_TO_MC;
            method = "put";
            break;
        }
        case ACE_ACTION.CONVERTED_ARCHITECT_CERTIFICATE_TO_INVOICE: {
            url = urls.ARCHITECT_CONVERT_TO_INVOICE;
            method = "put";
            break;
        }
        }
        if (url) {
            url = url.replace("{companyUuid}", companyUuid)
                .replace("{pcUuid}", pcUuid);
            if (method) {
                if (method === "put") return axios.put(url, body);
                if (method === "post") return axios.post(url, body);
                if (method === "delete") return axios.delete(url, body);
            }
            return axios.get(url);
        }
        throw new Error("Action is not defined");
    }

    getListChildOriginalOrder(isBuyer, companyUuid, pcUuid, itemParentUuid) {
        let url = "";
        if (isBuyer) {
            url = urls.OFFICIAL_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER.replace("{companyUuid}", companyUuid).replace("{pcUuid}", pcUuid).replace("{itemParentUuid}", itemParentUuid);
        } else {
            url = urls.OFFICIAL_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{pcUuid}", pcUuid).replace("{itemParentUuid}", itemParentUuid);
        }
        return axios.get(url);
    }

    getArchitectListChildOriginalOrder(isBuyer, companyUuid, pcUuid, itemParentUuid) {
        let url = "";
        if (isBuyer) {
            url = urls.ARCHITECT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_BUYER.replace("{companyUuid}", companyUuid).replace("{pcUuid}", pcUuid).replace("{itemParentUuid}", itemParentUuid);
        } else {
            url = urls.ARCHITECT_CLAIM_ORIGINAL_ORDER_LIST_CHILD_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{pcUuid}", pcUuid).replace("{itemParentUuid}", itemParentUuid);
        }
        return axios.get(url);
    }
}

export default new OfficialProgressiveClaimService();
