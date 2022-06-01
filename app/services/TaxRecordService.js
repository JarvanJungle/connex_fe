import axios from "axios";
import UserService from "./UserService";
import CONFIG from "./urlConfig";

class TaxRecordDataService {
    getTaxRecords(companyUuid) {
        return axios({ method: "GET", url: CONFIG.LIST_TAX_RECORDS_URL.replace("{companyUuid}", companyUuid) });
    }

    postUpdateTaxRecord({
        taxCode, description, companyUuid, active, isDefault, taxRate
    }) {
        const myTaxRate = this.parseTax(taxRate);
        const params = {
            taxCode, description, companyUuid, active, taxRate: myTaxRate, default: isDefault
        };
        return axios.post(CONFIG.UPDATE_TAX_RECORD_URL.replace("{companyUuid}", companyUuid), params);
    }

    postCreateTaxRecord({
        taxCode, taxRate, description, companyUuid, isDefault
    }) {
        const myTaxRate = this.parseTax(taxRate);
        const params = {
            taxCode, taxRate: myTaxRate, description, companyUuid, active: true, default: isDefault
        };
        return axios.post(CONFIG.CREATE_TAX_RECORD_URL.replace("{companyUuid}", companyUuid), params);
    }

    postUploadTaxRecords({ companyUuid, taxRecords }) {
        const params = { companyUuid, batchTaxDtoList: taxRecords };
        return axios.post(`${CONFIG.BATCH_UPLOAD_TAX_RECORDS.replace("{companyUuid}", companyUuid)}`, params);
    }

    deactivateTaxRecords(params) {
        return axios.put(`${CONFIG.DEACTIVATING_LIST_TAX_RECORDS_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid())}`, params);
    }

    activateTaxRecords(params,) {
        return axios.put(CONFIG.ACTIVATING_LIST_TAX_RECORDS_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()), params,
            { params: { companyUuid: UserService.getCurrentCompanyUuid() } });
    }

    getTaxRecord({ companyUuid, taxCode }) {
        return axios({ method: "GET", params: { companyUuid, taxCode }, url: CONFIG.GET_TAX_RECORD_URL.replace("{companyUuid}", companyUuid) });
    }

    parseTax(taxRate) {
        return parseFloat(taxRate.replace(/[^0-9.]+/g, ""));
    }
}

export default new TaxRecordDataService();
