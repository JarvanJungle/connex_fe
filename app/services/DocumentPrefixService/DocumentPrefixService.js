import axios from "axios";
import DOCUMENT_PREFIX_API from "./api";

class DocumentPrefixService {
    getAllPrefixes(companyUuid) {
        const url = DOCUMENT_PREFIX_API.LIST_DOCUMENT_PREFIXES.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getPrefixDetails(companyUuid, prefixUuid) {
        const url = DOCUMENT_PREFIX_API.DOCUMENT_PREFIX_DETAILS.replace("{companyUuid}", companyUuid).replace("{prefixUuid}", prefixUuid);
        return axios.get(url);
    }

    updatePrefix(companyUuid, data) {
        const url = DOCUMENT_PREFIX_API.UPDATE_PREFIX.replace("{companyUuid}", companyUuid);
        return axios.put(url, data);
    }

    generatePrefixes(companyUuid) {
        const url = DOCUMENT_PREFIX_API.CREATE_PREFIXES.replace("{companyUuid}", companyUuid);
        return axios.post(url);
    }
}

export default new DocumentPrefixService();