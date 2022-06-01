import axios from "axios";
import CONFIG from "./urlConfig";
import UserService from "./UserService";

class ConnectionDataService {
    getConnections(companyUuid) {
        return axios.get(`${CONFIG.GET_CONNECTIONS_URL.replace("{companyUuid}", companyUuid)}`);
    }

    getConnectionRequestCompanyDetails(connectionUuid) {
        return axios.get(`${CONFIG.GET_SENT_REQUEST_COMPANY_DETAILS_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid())}${connectionUuid}`);
    }

    postAcceptConnection(connections, connectionUuid) {
        return axios.post(`${CONFIG.ACCEPT_CONNECTION_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid())}${connectionUuid}`, connections);
    }

    postRejectConnection(connectionUuid) {
        return axios.put(`${CONFIG.REJECT_CONNECTION_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid())}${connectionUuid}`);
    }

    postCancelConnection(connectionUuid) {
        return axios.put(`${CONFIG.CANCEL_CONNECTION_URL.replace("{companyUuid}", UserService.getCurrentCompanyUuid())}${connectionUuid}`);
    }
}

export default new ConnectionDataService();
