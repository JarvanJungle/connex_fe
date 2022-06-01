import axios from "axios";
import CATEGORY_API from "./url";

class CategoryService {
    getListCategory(companyUuid) {
        const url = CATEGORY_API.CATEGORY_LIST_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getCategoryDetail(companyUuid, uuid) {
        const url = CATEGORY_API.CATEGORY_DETAILS_URL.replace("{companyUuid}", companyUuid).replace("{uuid}", uuid);
        return axios.get(url);
    }

    createCategory(companyUuid, body) {
        const url = CATEGORY_API.CATEGORY_CREATE_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    updateCategory(companyUuid, uuid, categoryDescription) {
        const url = CATEGORY_API.CATEGORY_UPDATE_URL.replace("{companyUuid}", companyUuid).replace("{uuid}", uuid).replace("{categoryDescription}", categoryDescription);
        return axios.put(url);
    }

    activate({ companyUuid, listCategory }) {
        const url = CATEGORY_API.CATEGORY_ACTIVATE_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, listCategory);
    }

    deactivate({ companyUuid, listCategory }) {
        const url = CATEGORY_API.CATEGORY_DEACTIVATE_URL.replace("{companyUuid}", companyUuid);
        return axios.put(url, listCategory);
    }

    postMassUploadCategory({ companyUuid, categoryList }) {
        const params = { companyUuid, categoryList };
        return axios.post(CATEGORY_API.CATEGORY_UPLOAD_URL.replace("{companyUuid}", companyUuid), params);
    }
}

export default new CategoryService();
