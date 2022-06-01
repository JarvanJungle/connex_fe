import axios from "axios";
import CONFIG from "services/urlConfig";

/**
 * @description Purchase Pre-Requisitions List Service
 */
class PreRequisitionService {
    /**
     *
     * @param {*} companyUuid
     * @returns API response - PPR List
     */
    getPPRList(companyUuid) {
        return axios.get(CONFIG.PPR_API.PURCHASE_PRE_REQUISITIONS_LIST_URL.replace("{companyUuid}", companyUuid));
    }

    getAllDocumentsOfPPR(companyUuid) {
        // const params = { pprUuid };
        return axios.get(CONFIG.PPR_API.PURCHASE_PRE_REQUISITIONS_LIST_URL.replace("{companyUuid}", companyUuid));
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprUuid
     * @returns
     */
    getPPRDetails(companyUuid, pprUuid) {
        const params = { pprUuid };
        return axios.get(CONFIG.PPR_API.GET_PPR_DETAIL_URL.replace("{companyUuid}", companyUuid), { params });
    }

    getPPROverview(companyUuid, uuid, child = false) {
        const url = CONFIG.PPR_API.GET_PPR_OVERVIEW_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", uuid).replace("{child}", child);
        return axios.get(url);
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprNumber
     * @returns
     */
    postAddDocuments(companyUuid, body) {
        return axios.post(CONFIG.PPR_API.ADD_BATCH_OF_DOCUMENTS_URL.replace("{companyUuid}", companyUuid), body);
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} userName
     * @param {*} userUuid
     * @param {*} role
     * @param {*} comment
     * @param {*} pprNumber
     * @returns
     */
    postInternalConversationPPR(companyUuid, userName, userUuid, role, comment, pprNumber) {
        const body = {
            userName,
            userUuid,
            role,
            comment,
            pprNumber,
            companyUuid
        };
        return axios.post(CONFIG.PPR_API.ADD_BATCH_OF_DOCUMENTS_URL.replace("{companyUuid}", companyUuid), body);
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} userName
     * @param {*} userUuid
     * @param {*} role
     * @param {*} comment
     * @param {*} pprNumber
     * @returns
     */
    //  postInternalConversationPPR(PPRDetailModel) {
    //     const body = {
    //         userName,
    //         userUuid,
    //         role,
    //         comment,
    //         pprNumber,
    //         companyUuid
    //     };
    //     return axios.post(CONFIG.PPR_API.ADD_BATCH_OF_DOCUMENTS_URL.replace("{companyUuid}", companyUuid), body);
    // }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprUuid
     * @returns
     */
    postSendBackPPR(companyUuid, pprUuid, body) {
        const params = { pprUuid };
        return axios.post(CONFIG.PPR_API.SEND_BACK_PPR_URL.replace("{companyUuid}", companyUuid), body, { params });
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprUuid
     * @returns
     */
    postRecallPPR(companyUuid, pprUuid) {
        const params = { pprUuid };
        return axios.post(CONFIG.PPR_API.RECALL_PPR_URL.replace("{companyUuid}", companyUuid), null, { params });
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprUuid
     * @returns
     */
    postApprovePPR(companyUuid, pprUuid, body) {
        const params = { pprUuid };
        return axios.post(CONFIG.PPR_API.APPROVE_PPR_URL.replace("{companyUuid}", companyUuid), body, { params });
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprUuid
     * @returns
     */
    postRejectPPR(companyUuid, pprUuid, body) {
        const params = { pprUuid };
        return axios.post(CONFIG.PPR_API.REJECT_PPR_URL.replace("{companyUuid}", companyUuid), body, { params });
    }

    postCreatePPR(companyUuid, body) {
        return axios.post(CONFIG.PPR_API.CREATE_PRE_REQUISITIONS_URL.replace("{companyUuid}", companyUuid), body);
    }

    postSaveAsDraftPPR(companyUuid, body) {
        return axios.post(CONFIG.PPR_API.SAVE_AS_DRAFT_URL.replace("{companyUuid}", companyUuid), body);
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} pprNumber
     * @returns
     */
    postCancelPPR(companyUuid, pprUuid) {
        const params = { pprUuid };
        return axios.post(CONFIG.PPR_API.CANCEL_PPR_URL.replace("{companyUuid}", companyUuid), {}, { params });
    }

    /**
     *
     * @param {*} companyUuid
     * @param {*} body
     * @returns
     */
    postEditPPR(companyUuid, body) {
        const urlPath = CONFIG.PPR_API.EDIT_A_SENT_BACK_OR_RECALL_PPR_URL.replace("{companyUuid}", companyUuid);
        return axios.post(urlPath, body);
    }
}

export default new PreRequisitionService();
