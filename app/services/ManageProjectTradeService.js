import axios from "axios";
import CONFIG from "./urlConfig";

class ManageProjectTradeService {
    getProjectTrade(companyUuid, tradeCodeUuid) {
        return axios.get(`${CONFIG.GET_PROJECT_TRADE.replace("{companyUuid}", companyUuid)}?tradeCodeUuid=${tradeCodeUuid}`);
    }

    getListProjectTrade({ companyUuid }) {
        return axios.get(`${CONFIG.LIST_PROJECT_TRADES.replace("{companyUuid}", companyUuid)}`);
    }

    updateProjectTrade(projectTrade) {
        return axios.post(CONFIG.UPDATE_PROJECT_TRADE_API.replace("{companyUuid}", projectTrade.companyUuid), projectTrade);
    }

    createProjectTrade(projectTrade) {
        return axios.post(CONFIG.CREATE_PROJECT_TRADE_URL.replace("{companyUuid}", projectTrade.companyUuid), projectTrade);
    }

    deactivateProjectTrade(params, companyUuid) {
        return axios.put(`${CONFIG.DEACTIVATING_LIST_PROJECT_TRADE_URL.replace("{companyUuid}", companyUuid)}`, params);
    }

    activateProjectTrade(params, companyUuid) {
        return axios.put(`${CONFIG.ACTIVATING_LIST_PROJECT_TRADE_URL.replace("{companyUuid}", companyUuid)}`, params);
    }

    massUploadProjectTrade(projectTrade, companyUuid) {
        const body = { companyUuid, batchTradeDtoList: projectTrade}
        return axios.post(CONFIG.MASS_UPLOAD_PROJECT_TRADE_URL.replace("{companyUuid}", companyUuid), body);
    }
}

export default new ManageProjectTradeService();
