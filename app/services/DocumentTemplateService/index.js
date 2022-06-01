import axios from "axios";
import DOCUMENT_TEMPLATE_API from "./api";

class DocumentTemplateService {
    static getDocumentTemplateSettings(companyUuid) {
        const url = DOCUMENT_TEMPLATE_API.GET_DOCUMENT_TEMPLATE_SETTINGS.replace("{companyUuid}", companyUuid);
        return axios.get(url).then((res) => res?.data);
    }

    static updateDocumentTemplateSettings(companyUuid, body) {
        const url = DOCUMENT_TEMPLATE_API.UPDATE_DOCUMENT_TEMPLATE_SETTINGS.replace("{companyUuid}", companyUuid);
        return axios.put(url, body);
    }
}

export default DocumentTemplateService;
