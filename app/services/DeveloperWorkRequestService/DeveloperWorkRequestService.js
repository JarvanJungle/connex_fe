import axios from "axios";
import { DWR_ACTIONS } from "helper/constantsDefined";
import DEVELOPER_WORK_REQUEST_API from "./api";

class DeveloperWorkRequestService {
    getRequisitionList(companyUuid) {
        const url = DEVELOPER_WORK_REQUEST_API.GET_WORK_REQUISITION_LIST.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    createRequisition(companyUuid, data) {
        const url = DEVELOPER_WORK_REQUEST_API.CREATE_WORK_REQUISITION.replace("{companyUuid}", companyUuid);
        return axios.post(url, data);
    }

    getRequisitionDetails(companyUuid, dwrUuid) {
        const url = DEVELOPER_WORK_REQUEST_API.GET_WORK_REQUISITION_DETAILS
            .replace("{companyUuid}", companyUuid)
            .replace("{dwrUuid}", dwrUuid);
        return axios.get(url);
    }

    getListChildWorkSpace(isBuyer, companyUuid, dwrUuid, itemParentUuid) {
        let url = "";
        if (isBuyer) {
            url = DEVELOPER_WORK_REQUEST_API.GET_LIST_CHILD.replace("{companyUuid}", companyUuid).replace("{dwrUuid}", dwrUuid).replace("{itemParentUuid}", itemParentUuid);
        } else {
            url = DEVELOPER_WORK_REQUEST_API.GET_LIST_CHILD_BY_SUPPLIER.replace("{companyUuid}", companyUuid).replace("{dwrUuid}", dwrUuid).replace("{itemParentUuid}", itemParentUuid);
        }
        return axios.get(url);
    }

    updateRequisition(companyUuid, dwrUuid, action, body = {}) {
        let url = null;
        let method = null;
        switch (action) {
        case DWR_ACTIONS.APPROVE:
            url = DEVELOPER_WORK_REQUEST_API.APPROVE_WORK_REQUISITION;
            method = "put";
            break;
        case DWR_ACTIONS.CANCEL:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.CANCEL_WORK_REQUISITION;
            break;
        case DWR_ACTIONS.RECALL:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.RECALL_WORK_REQUISITION;
            break;
        case DWR_ACTIONS.REJECT:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.REJECT_WORK_REQUISITION;
            break;
        case DWR_ACTIONS.SEND_BACK:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.SEND_BACK_WORK_REQUISITION;
            break;
        case DWR_ACTIONS.SAVE_AS_DRAFT:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.SAVE_WORK_REQUISITION_DRAFT;
            break;
        case DWR_ACTIONS.SUBMIT:
            method = "put";
            url = DEVELOPER_WORK_REQUEST_API.SUBMIT_WORK_REQUISITION;
            break;
        case DWR_ACTIONS.CONVERT_TO_DVWO:
            method = "post";
            url = DEVELOPER_WORK_REQUEST_API.CONVERT_TO_DVWO;
            break;
        default:
            break;
        }
        if (url) {
            url = url.replace("{companyUuid}", companyUuid).replace("{dwrUuid}", dwrUuid);
            if (method) {
                if (method === "put") return axios.put(url, body);
                if (method === "post") return axios.post(url, body);
                if (method === "delete") return axios.delete(url, body);
            }
            return axios.get(url);
        }
        throw new Error("Action is not defined");
    }
}

export default new DeveloperWorkRequestService();
