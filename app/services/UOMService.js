import axios from "axios";
import CONFIG from "./urlConfig";

class UOMDataService {
    getUOMRecords(companyUuid) {
        return axios.get(CONFIG.GET_UOM_URL.replace("{companyUuid}", companyUuid));
    }

    postUpdateUOM({
        uomCode, uomName, companyUuid, active, description
    }) {
        const params = {
            uomCode, uomName, companyUuid, active, description
        };
        return axios.post(CONFIG.UPDATE_UOM_URL.replace("{companyUuid}", companyUuid), params);
    }

    postCreateUOM({
        uomCode, uomName, companyUuid, description
    }) {
        const params = {
            uomCode, uomName, active: true, description
        };
        return axios.post(CONFIG.CREATE_UOM_URL.replace("{companyUuid}", companyUuid), params);
    }

    postUploadUOMs({ companyUuid, uoms }) {
        const params = { batchUomDtoList: uoms };
        return axios.post(`${CONFIG.BATCH_UPLOAD_UOM_URL.replace("{companyUuid}", companyUuid)}`, params);
    }

    putMassActivateUOMs({ companyUuid, uomCodeList }) {
        return axios.put(`${CONFIG.MASS_ACTIVATE_UOM_URL.replace("{companyUuid}", companyUuid)}`, uomCodeList);
    }

    putMassDeactivateUOMs({ companyUuid, uomCodeList }) {
        return axios.put(`${CONFIG.MASS_DEACTIVATE_UOM_URL.replace("{companyUuid}", companyUuid)}`, uomCodeList);
    }

    getUOMDetails({ companyUuid, uomCode }) {
        return axios({ params: { uomCode }, method: "GET", url: CONFIG.GET_UOM_DETAILS.replace("{companyUuid}", companyUuid) });
    }
}

export default new UOMDataService();
