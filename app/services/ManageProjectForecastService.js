import axios from "axios";
import CONFIG from "services/urlConfig";

class ManageProjectForecastService {
    /**
     *
     * @param {*} companyUuid
     * @param {*} projectCode
     * @returns
     */
    getProjectForecastDetail(companyUuid, projectCode) {
        const urlPath = CONFIG.MANAGE_PROJECT_FORECAST_API.PROJECT_FORECAST_DETAILS_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{projectCode}", projectCode);
        return axios.get(urlPath);
    }

    /**
     * 
     * @param {*} companyUuid 
     * @param {*} projectCode 
     * @returns 
     */
    getItemsFromProjectForecast(companyUuid, projectCode) {
        const urlPath = CONFIG.MANAGE_PROJECT_FORECAST_API.ITEMS_FROM_PROJECT_FORECAST_URL
            .replace("{companyUuid}", companyUuid)
            .replace("{projectCode}", projectCode);
        return axios.get(urlPath);
    }
}

export default new ManageProjectForecastService();
