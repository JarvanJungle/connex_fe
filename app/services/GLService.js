import axios from "axios";
import CONFIG from "./urlConfig";

class GLDataService {
    getGLs(companyUuid) {
        return axios.get(CONFIG.LIST_GL_URL.replace("{companyUuid}", companyUuid));
    }

    postUpdateGL({
        accountNumber, description, companyUuid, active, costCodeDtoList, departmentCodeDtoList
    }) {
        const params = {
            accountNumber, description, companyUuid, active, costCodeDtoList, departmentCodeDtoList
        };
        return axios.post(CONFIG.UPDATE_GL_URL.replace("{companyUuid}", companyUuid), params);
    }

    postCreateGL({
        accountNumber, description, companyUuid, costCodeDtoList, departmentCodeDtoList
    }) {
        const params = {
            accountNumber,
            description,
            companyUuid,
            active: true,
            costCodeDtoList,
            departmentCodeDtoList
        };
        return axios.post(CONFIG.CREATE_GL_URL.replace("{companyUuid}", companyUuid), params);
    }

    postUploadGLs({ companyUuid, gls }) {
        const params = { companyUuid, batchGLDtoList: gls };
        return axios.post(`${CONFIG.BATCH_UPLOAD_GL_URL.replace("{companyUuid}", companyUuid)}`, params);
    }

    /* CUSTOM SERVICES */

    /**
     *
     * @param { companyUuid, gls }
     * @returns activity state of GL after Activate
     */
    postActivateGL({ companyUuid, gls }) {
        // const body = { accountNumberList: gls}
        return axios.put(`${CONFIG.ACTIVATE_GL.replace("{companyUuid}", companyUuid)}`, gls);
    }

    /**
     *
     * @param { companyUuid, gls }
     * @returns activity state of GL after Deactivate
     */
    postDeactivateGL({ companyUuid, gls }) {
        // const body = { accountNumberList: gls}
        return axios.put(`${CONFIG.DEACTIVATE_GL.replace("{companyUuid}", companyUuid)}`, gls);
    }

    /**
     *
     * @param { companyUuid, gls }
     * @returns GL details
     */
    getGLDetails({ companyUuid, accountNumber }) {
        return axios({
            params: {
                companyUuid,
                accountNumber
            },
            method: "GET",
            url: CONFIG.GET_GL_DETAILS.replace("{companyUuid}", companyUuid)
        });
    }

    /* END CUSTOM SERVICES */
}

export default new GLDataService();
