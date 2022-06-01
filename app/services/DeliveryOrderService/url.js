import { PURCHASE_URL } from "services/urlConfig/UrlFeatureConfigurations/basicUrlConfig";

const DO_API = {
    /* DELIVERY_ORDER - APIs */
    DELIVERY_ORDER_LIST_URL: `${PURCHASE_URL}/{companyUuid}/delivery-order/list`,
    DELIVERY_ORDER_PO_LIST_URL: `${PURCHASE_URL}/{companyUuid}/delivery-order/po/list`,
    DELIVERY_ORDER_DETAILS: `${PURCHASE_URL}/{companyUuid}/delivery-order/details?doUuid={doUuid}`,
    DELIVERY_ORDER_OVERVIEW: `${PURCHASE_URL}/{companyUuid}/delivery-order/overview?uuid={doUuid}&child={child}`,
    DELIVERY_ORDER_CREATE_DETAILS: `${PURCHASE_URL}/{companyUuid}/delivery-order/create-do-details`,
    DELIVERY_ORDER_CREATE_NEW: `${PURCHASE_URL}/{companyUuid}/delivery-order/create-do`,
    DELIVERY_ORDER_ISSUE: `${PURCHASE_URL}/{companyUuid}/delivery-order/issue`,
    DELIVERY_ORDER_VIEW_PDF_URL: `${PURCHASE_URL}/{companyUuid}/delivery-order/buyer/pdf/{uuid}`,
    DELIVERY_ORDER_VIEW_PDF_SUPPLIER_URL: `${PURCHASE_URL}/{companyUuid}/delivery-order/supplier/pdf/{uuid}`
    /* END DELIVERY_ORDER - APIs */
};

Object.freeze(DO_API);
export default DO_API;
