import axios from "axios";
import CONFIG from "./urlConfig";
import UserService from "./UserService";

const { CREATE_CURRENCY_URL } = CONFIG;
const { LIST_CURRENCY_URL } = CONFIG;
const { GET_CURRENCY_DETAILS_URL } = CONFIG;
const { UPDATE_CURRENCY_URL } = CONFIG;
const { UPLOAD_CURRENCY_URL } = CONFIG;
const { DEACTIVATE_CURRENCY_URL } = CONFIG;
const { ACTIVATE_CURRENCY_URL } = CONFIG;

class CurrenciesService {

    getCurrencies(companyUuid) {
        return axios.get(LIST_CURRENCY_URL.replace("{companyUuid}", companyUuid));
    }

    getCurrencyDetails(companyUuid, currencyCode) {
        return axios.get(`${GET_CURRENCY_DETAILS_URL.replace("{companyUuid}", companyUuid)}/${currencyCode}`);
    }

    addCurrency(currencyData) {
        return axios.post(CREATE_CURRENCY_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()), currencyData);
    }

    updateCurrency(currencyData) {
        return axios.put(UPDATE_CURRENCY_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()), currencyData);
    }

    massUploadCurrency(massUploadCurrecyData) {
        return axios.post(UPLOAD_CURRENCY_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid()), massUploadCurrecyData);
    }

    deactivateCurrency(companyUuid, currencyCodeList) {
        return axios.put(DEACTIVATE_CURRENCY_URL.replace("{companyUuid}", companyUuid), currencyCodeList);
    }

    activateCurrency(companyUuid, currencyCodeList) {
        console.log("activating currency");
        return axios.put(ACTIVATE_CURRENCY_URL.replace("{companyUuid}", companyUuid), currencyCodeList);
    }
}

export default new CurrenciesService();
