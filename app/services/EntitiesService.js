import axios from "axios";
import CONFIG from "./urlConfig";

const ENTITIES_LIST_URL = CONFIG.GET_ENTITIES_LIST;
const { CREATE_ENTITY_URL } = CONFIG;
const { UPLOAD_DOCUMENT_URL } = CONFIG;
const { UPLOAD_IMAGE_URL } = CONFIG;
const { DOWNLOAD_DOCUMENT_URL } = CONFIG;
const { DELETE_DOCUMENT_URL } = CONFIG;
const { GET_ENTITY_URL } = CONFIG;
const { UPDATE_ENTITY_URL } = CONFIG;
const { ENTITY_TYPE_URL } = CONFIG;
const { INDUSTRY_TYPE_URL } = CONFIG;
const { DEACTIVATE_ENTITY_URL } = CONFIG;
const { REACTIVATE_ENTITY_URL } = CONFIG;
const { GET_USER_LIST_ENTITY_ENTITYADMIN } = CONFIG;
const { CREATE_AND_UPDATE_PERMISSION_FOR_ONE_USER } = CONFIG;
const { LIST_ALL_THE_USER_PERMISSION_WITHIN_A_COMPANY } = CONFIG;

class EntitiesService {
    getEntities() {
        return axios.get(ENTITIES_LIST_URL);
    }

    getEntity(guid) {
        return axios.get(GET_ENTITY_URL + guid);
    }

    createEntity(entity) {
        return axios.post(CREATE_ENTITY_URL, entity);
    }

    updateEntity(entity) {
        return axios.post(UPDATE_ENTITY_URL, entity);
    }

    uploadDocuments(data) {
        return axios.post(UPLOAD_DOCUMENT_URL, data);
    }

    uploadImage(data) {
        return axios.post(UPLOAD_IMAGE_URL, data);
    }

    downloadDocuments(category, guid) {
        return axios.get(DOWNLOAD_DOCUMENT_URL, {
            params: {
                category,
                guid
            }
        });
    }

    deleteDocuments(guid) {
        return axios.put(`${DELETE_DOCUMENT_URL}/${guid}`);
    }

    retrieveEntityType() {
        return axios.get(ENTITY_TYPE_URL);
    }

    getUserListOfEntity(entityUuid) {
        return axios.get(GET_USER_LIST_ENTITY_ENTITYADMIN.replace("{uuid}", entityUuid));
    }

    retrieveIndustryType() {
        return axios.get(INDUSTRY_TYPE_URL);
    }

    deactivateEntity(uuid) {
        return axios.put(`${DEACTIVATE_ENTITY_URL}/${uuid}`);
    }

    reactivateEntity(uuid) {
        return axios.put(`${REACTIVATE_ENTITY_URL}/${uuid}`);
    }

    createAndUpdatePermissionForOneUser(body) {
        return axios.post(CREATE_AND_UPDATE_PERMISSION_FOR_ONE_USER, body);
    }

    listAllTheUserPermissionWithinACompany(companyUuid) {
        return axios.get(LIST_ALL_THE_USER_PERMISSION_WITHIN_A_COMPANY + companyUuid);
    }

    getDetailsUserPermission(userUuid, companyUuid) {
        return axios.get(GET_DETAILS_USER_PERMISSION
            .replace('{userUuid}', userUuid)
            .replace('{companyUuid}', companyUuid)
        );
    }
}

export default new EntitiesService();
