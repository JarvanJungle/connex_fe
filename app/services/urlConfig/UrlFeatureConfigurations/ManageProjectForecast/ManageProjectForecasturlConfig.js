import { ENTITIES_URL } from "../basicUrlConfig";

const MANAGE_PROJECT_FORECAST_API = {
    /* MANAGE PROJECT FORECAST - APIs */
    PROJECT_FORECAST_DETAILS_URL: `${ENTITIES_URL}/{companyUuid}/project-forecast/details/{projectCode}`,
    ITEMS_FROM_PROJECT_FORECAST_URL: `${ENTITIES_URL}/{companyUuid}/project-forecast/project-forecast-items/{projectCode}`
    /* END MANAGE PROJECT FORECAST - APIs */
};

export default MANAGE_PROJECT_FORECAST_API;
