import axios from "axios";

const BASE_URL = process.env.REACT_APP_SERVICE_API;
class SideBarDataService {
    getSidebar() {
        return axios.get(`${BASE_URL}/hardcoded`);
    }
}

export default new SideBarDataService();
