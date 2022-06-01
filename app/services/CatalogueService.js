import axios from "axios";
import CONFIG from "./urlConfig";
import UserService from "./UserService";

class CatalogueDataService {
    getCatalogues(companyUuid) {
        return axios.get(`${CONFIG.LIST_CATALOGUES_URL.replace("{companyUuid}", companyUuid)}`);
    }

    getCataloguesV2(companyUuid, query) {
        return axios.get(`${CONFIG.LIST_CATALOGUES_V2_URL.replace("{companyUuid}", companyUuid)}`, {
            params: query
        });
    }

    getCataloguesV2Manage(companyUuid, query) {
        return axios.get(`${CONFIG.LIST_CATALOGUES_V2_MANAGE_URL.replace("{companyUuid}", companyUuid)}`, {
            params: query
        });
    }

    getManualCatalogues(companyUuid) {
        return axios.get(`${CONFIG.LIST_MANUAL_CATALOGUES_URL.replace("{companyUuid}", companyUuid)}`);
    }

    getCatalogueDetails({ companyUuid, catalogueItemCode }) {
        return axios.get(`${CONFIG.GET_CATALOGUE_DETAILS_URL.replace("{companyUuid}", companyUuid)}/${catalogueItemCode}`);
    }

    postCreateCatalogue(body) {
        return axios.post(CONFIG.CREATE_CATALOGUE_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()), body);
    }

    putUpdateCatalogue(body, uuid) {
        return axios.put(CONFIG.UPDATE_CATALOGUE_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()).replace("{uuid}", uuid), body);
    }

    postMassUploadCatalogues({ companyUuid, catalogueList }) {
        const params = { companyUuid, catalogueList };
        return axios.post(CONFIG.BATCH_UPLOAD_CATALOGUES.replace("{companyUuid}", companyUuid), params);
    }

    putActivateCatalogues({ companyUuid, catalogueList }) {
        return axios.put(`${CONFIG.ACTIVATE_CATALOGUES_URL.replace("{companyUuid}", companyUuid)}`, catalogueList);
    }

    putDeactivateCatalogues({ companyUuid, catalogueList }) {
        return axios.put(`${CONFIG.DEACTIVATE_CATALOGUES_URL.replace("{companyUuid}", companyUuid)}`, catalogueList);
    }

    getAuditTrailCatalogue({ companyUuid, catalogueItemCode }) {
        return axios.get(`${CONFIG.AUDIT_TRAIL_CATALOGUE_URL.replace("{companyUuid}", companyUuid)}/${catalogueItemCode}`);
    }

    getSpecialCatalogue(companyUuid, projectCode, body) {
        return axios.post(`${CONFIG.GET_SPECIAL_CATALOGUE_URL.replace("{companyUuid}", companyUuid).replace("{projectCode}", projectCode)}`, body);
    }

    getCatalogueDetailsByItemCode(companyUuid, itemCode) {
        return axios.get(`${CONFIG.GET_CATALOGUE_DETAILS_BY_ITEM_CODE_URL.replace("{companyUuid}", companyUuid).replace("{itemCode}", itemCode)}`);
    }
}

export default new CatalogueDataService();
