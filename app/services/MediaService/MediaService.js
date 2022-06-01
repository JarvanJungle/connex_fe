import axios from "axios";
import CONFIG from "../urlConfig";

class MediaService {
    postUploadFile(formData) {
        const config = {
            headers: {
                "content-type": "multipart/form-data"
            }
        };
        const urlPath = CONFIG.MEDIA_API.UPLOAD_FILES_URL;
        return axios.post(urlPath, formData, config);
    }
}

export default new MediaService();
