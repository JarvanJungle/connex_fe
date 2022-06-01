import axios from "axios";
import CONTRACT_REQUEST_FORM_API from "./urls";
import urls from "./urls";

class ContractModuleService {
    getContractRequestList(companyUuid) {
        const apiURL = urls.CONTRACT_REQUEST_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(apiURL);
    }

    getContractRequestDetail(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_DETAIL_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.get(apiURL);
    }

    approveContractRequest(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_APPROVE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.put(apiURL);
    }

    approveContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_APPROVE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    convertCRToContract(companyUuid, contractRequestUuid) {
        const url = CONTRACT_REQUEST_FORM_API.CONTRACT_REQUEST_CONVERT_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.post(url);
    }

    rejectContractRequest(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_REJECT_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.put(apiURL);
    }

    rejectContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_REJECT_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    recallContractRequest(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_RECALL_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.put(apiURL);
    }

    recallContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_RECALL_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    cancelContractRequest(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_CANCEL_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.put(apiURL);
    }

    sendBackContractRequest(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_REQUEST_SEND_BACK_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractRequestUuid}", contractRequestUuid);
        return axios.put(apiURL);
    }

    sendBackContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_SEND_BACK_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    issueContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_ISSUE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    acknowledgementContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_ACKNOWLEDGE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    terminateContract(companyUuid, contractUuid) {
        const apiURL = urls.CONTRACT_TERMINATE_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(apiURL);
    }

    getContractListByType(isBuyer, companyUuid) {
        const rootURL = isBuyer ? urls.CONTRACT_BUYER_LIST_URL : urls.CONTRACT_SUPPLIER_LIST_URL;
        const apiURL = rootURL.replace("{companyUuid}", companyUuid);
        return axios.get(apiURL);
    }

    getContractDetailByType(isBuyer, companyUuid, contractUuid) {
        const urlAPI = isBuyer ? urls.CONTRACT_DETAIL_BUYER_URL : urls.CONTRACT_DETAIL_SUPPLIER_URL;
        const apiURL = urlAPI
            .replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.get(apiURL);
    }

    submitContractDraftRequest(companyUuid, body) {
        const url = CONTRACT_REQUEST_FORM_API.CONTRACT_REQUEST_DRAFT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    submitContractRequest(companyUuid, body) {
        const url = CONTRACT_REQUEST_FORM_API.CONTRACT_REQUEST_SUBMIT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    submitContract(companyUuid, contractUuid, body) {
        const url = CONTRACT_REQUEST_FORM_API.CONTRACT_SUBMIT_URL.replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(url, body);
    }

    submitContractDraft(companyUuid, contractUuid, body) {
        const url = CONTRACT_REQUEST_FORM_API.CONTRACT_DRAFT_URL.replace("{companyUuid}", companyUuid)
            .replace("{contractUuid}", contractUuid);
        return axios.put(url, body);
    }

    getAuditTrails(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_DETAILS_URL.replace("{companyUuid}", companyUuid);
        const auditAPIURL = apiURL + contractRequestUuid;
        return axios.get(auditAPIURL);
    }

    getBudgetDetails(companyUuid, projectCode) {
        const apiURL = urls.CONTRACT_BUDGET_DETAILS_URL.replace("{companyUuid}", companyUuid);
        const budgetURL = apiURL.replace("{projectCode}", projectCode);
        return axios.get(budgetURL);
    }

    getContractItems(companyUuid, contractRequestUuid) {
        const apiURL = urls.CONTRACT_DETAILS_URL.replace("{companyUuid}", companyUuid);
        const itemAPIURL = apiURL + contractRequestUuid;
        return axios.get(itemAPIURL);
    }
}

export default new ContractModuleService();
