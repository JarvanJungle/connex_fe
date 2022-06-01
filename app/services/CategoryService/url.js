import { ENTITIES_URL } from "services/urlConfig/UrlFeatureConfigurations/basicUrlConfig";

const CATEGORY_API = {
    /* CATEGORY - APIs */
    CATEGORY_LIST_URL: `${ENTITIES_URL}/{companyUuid}/category/list`,
    CATEGORY_DETAILS_URL: `${ENTITIES_URL}/{companyUuid}/category/detail/{uuid}`,
    CATEGORY_CREATE_URL: `${ENTITIES_URL}/{companyUuid}/category/add`,
    CATEGORY_UPDATE_URL: `${ENTITIES_URL}/{companyUuid}/category/update/{uuid}/{categoryDescription}`,
    CATEGORY_ACTIVATE_URL: `${ENTITIES_URL}/{companyUuid}/category/activate`,
    CATEGORY_DEACTIVATE_URL: `${ENTITIES_URL}/{companyUuid}/category/deactivate`,
    CATEGORY_UPLOAD_URL: `${ENTITIES_URL}/{companyUuid}/category/upload`
    /* END CATEGORY - APIs */
};

Object.freeze(CATEGORY_API);
export default CATEGORY_API;
