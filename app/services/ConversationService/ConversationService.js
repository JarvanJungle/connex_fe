import axios from "axios";
import CONVERSATION_API from "./url";

class ConversationService {
    createExternalConversation(companyUuid, body) {
        const url = CONVERSATION_API.CREATE_EXTERNAL_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    createInternalConversation(companyUuid, body) {
        const url = CONVERSATION_API.CREATE_INTERNAL_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getDetailExternalConversation(companyUuid, featureUuid) {
        const url = CONVERSATION_API.GET_DETAIL_EXTERNAL_URL.replace("{companyUuid}", companyUuid).replace("{featureUuid}", featureUuid);
        return axios.get(url);
    }

    getDetailInternalConversation(companyUuid, featureUuid) {
        const url = CONVERSATION_API.GET_DETAIL_INTERNAL_URL.replace("{companyUuid}", companyUuid).replace("{featureUuid}", featureUuid);
        return axios.get(url);
    }
}

export default new ConversationService();
