import axios from "axios";
import CONFIG from "./urlConfig";

class PaymentSetting {
    getPaymentSettingList(companyUuid) {
        const url = CONFIG.LIST_OF_PAYMENT_SETTING.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getPaymentSettingEntity(companyUuid) {
        const url = CONFIG.PAYMENT_SETTING_ENTITY.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    setDefaultSettingList(companyUuid, body) {
        const url = CONFIG.SET_DEFAULT_PAYMENT_SETTING.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }
}

export default new PaymentSetting();
