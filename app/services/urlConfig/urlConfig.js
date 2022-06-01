import DOCUMENT_PREFIX_ROUTES from "routes/EntityAdmin/ManageDocumentPrefix/routes";
import FEATURES_MATRIX_ROUTES from "routes/EntityAdmin/ManageFeaturesMatrix/routes";
import DW_REQUEST_ROUTES from "services/DeveloperWorkRequestService/urls";
import PROGRESSIVE_ROUTES from "routes/Entities/ProgressiveClaims/routes";
import BANK_ACCOUNT_ROUTES_PATH from "routes/EntityAdmin/ManageBankAccount/routes";
import SUPPLIER_BANK_ACCOUNT_ROUTES_PATH from "routes/EntityAdmin/ManageSupplierBankAccount/routes";
import MEDIA_API from "../MediaService/MediaUrlConfig";
import MANAGE_PROJECT_FORECAST_API from "./UrlFeatureConfigurations/ManageProjectForecast/ManageProjectForecasturlConfig";
import APPROVAL_MATRIX_MANAGEMENT_API from "./UrlFeatureConfigurations/ApprovalMatrixManagement/ApprovalMatrixManagementUrlConfig";
import MANAGE_PROJECT_API from "./UrlFeatureConfigurations/ManageProject/ManageProjectUrlConfig";
import { PPR_API, PPR_ROUTING } from "./UrlFeatureConfigurations/PurchasePreRequision/PurchasePreRequisitionUrlConfig";

const ENTITIES_PREFIX = "entities";
export const AUTH_PREFIX = "auth/api";
const MEDIA_PREFIX = "media";
const PRIVILEGES_PREFIX = "privileges";
const TRANSACTION_PREFIX = "/transactional-setting";
export const BASE_URL = process.env.BASE_URL || "http://localhost:8762/";
const OAUTH_URL = process.env.OAUTH_URL || "http://localhost:8031/";
export const BASE_ENTITIES = `${BASE_URL + ENTITIES_PREFIX}`;
// const BASE_ENTITIES_TRANSACTION_PREFIX = `${BASE_ENTITIES + TRANSACTION_PREFIX}`;

const URL_CONFIG = {
    ROOT_AUTH_URL: BASE_URL + AUTH_PREFIX,

    LOGIN_PATH: `${BASE_URL + AUTH_PREFIX}/users/signin`,
    SSO_LOGIN_PATH: `${BASE_URL}login`,
    SSO_LOGOUT_PATH: `${OAUTH_URL}logout`,
    SSO_GET_TOKEN: `${BASE_URL}auth/token`,
    SETUP_PASSWORD: `${BASE_URL + AUTH_PREFIX}/users/setup-password`,
    TWOFA_SIGNUP: `${BASE_URL + AUTH_PREFIX}/users/twofa/signup`,
    TWOFA_VERIFICATION: `${BASE_URL + AUTH_PREFIX}/users/twofa/verification`,
    TWOFA_LOGIN: `${BASE_URL + AUTH_PREFIX}/users/twofa/signin`,
    PASSWORD_RESET: `${BASE_URL + AUTH_PREFIX}/users/password/reset`,
    PASSWORD_OWN_RESET: `${BASE_URL + AUTH_PREFIX}/users/password/own/reset`,
    TWOFA_RESET: `${BASE_URL + AUTH_PREFIX}/users/twofa/reset`,
    TWOFA_OWN_RESET: `${BASE_URL + AUTH_PREFIX}/users/twofa/own/reset`,
    GET_ENTITIES_LIST: `${BASE_URL + AUTH_PREFIX}/org/list`,
    CREATE_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/org/create`,
    UPLOAD_DOCUMENT_URL: `${BASE_URL + MEDIA_PREFIX}/storageMedia/upload`,
    UPLOAD_IMAGE_URL: `${BASE_URL + MEDIA_PREFIX}/image/upload`,
    DOWNLOAD_DOCUMENT_URL: `${BASE_URL + MEDIA_PREFIX}/storageMedia/view`,
    GET_OWN_DETAILS: `${BASE_URL + AUTH_PREFIX}/users/me`,
    GET_USER_DETAILS: `${BASE_URL + AUTH_PREFIX}/users/details/`,
    DELETE_DOCUMENT_URL: `${BASE_URL + MEDIA_PREFIX}/storageMedia/delete`,
    GET_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/org/get-entity-details/`,
    GET_ENTITY_ENTITYADMIN: `${BASE_URL + AUTH_PREFIX}/users/entity/`,
    GET_USER_LIST_ENTITY_ENTITYADMIN: `${BASE_URL + AUTH_PREFIX}/users/entity/list/{uuid}`,
    DEACTIVATE_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/org/delete`,
    REACTIVATE_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/org/reactivate`,

    UPDATE_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/org/update`,
    ENTITY_TYPE_URL: `${BASE_URL + AUTH_PREFIX}/org/entity-type-list`,
    INDUSTRY_TYPE_URL: `${BASE_URL + AUTH_PREFIX}/org/industry-type-list`,
    GET_ENTITY_USERS: `${BASE_URL + AUTH_PREFIX}/users/{companyUuid}/entity/list`,
    GET_COMPANY_USERS: `${BASE_URL + AUTH_PREFIX}/users/company/list/`,
    UPDATE_USER: `${BASE_URL + AUTH_PREFIX}/users/update`,
    UPDATE_USER_AVATAR: `${BASE_URL + AUTH_PREFIX}/users/update-avatar`,
    DEACTIVATE_USER: `${BASE_URL + AUTH_PREFIX}/users/deactivate/`,
    ACTIVATE_USER: `${BASE_URL + AUTH_PREFIX}/users/activate/`,
    DELETE_USER: `${BASE_URL + AUTH_PREFIX}/users/delete/`,
    CREATE_USER: `${BASE_URL + AUTH_PREFIX}/users/create`,
    GET_COMPANIES_LIST: `${BASE_URL + AUTH_PREFIX}/company/list`,
    COMPANIES_LIST_UNDER_ENTITY_URL: `${BASE_URL + AUTH_PREFIX}/company/{entityUuid}/list`,
    GET_ALL_COMPANIES_LIST: `${BASE_URL + AUTH_PREFIX}/company/list`,
    CREATE_COMPANY_URL: `${BASE_URL + AUTH_PREFIX}/company/create`,
    GET_COMPANY_URL: `${BASE_URL + AUTH_PREFIX}/company/get-company-details/`,
    UPDATE_COMPANY_URL: `${BASE_URL + AUTH_PREFIX}/company/update`,
    DEACTIVATE_COMPANY_URL: `${BASE_URL + AUTH_PREFIX}/company/delete`,
    REACTIVATE_COMPANY_URL: `${BASE_URL + AUTH_PREFIX}/company/reactivate`,

    GET_COMPANY_ADDRESSES: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/company`,
    GET_ADDRESS_DETAILS: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/details/`,
    UPDATE_ADDRESS_DETAILS: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/update`,
    CREATE_ADDRESS_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/create`,
    MASS_UPLOAD_ADDRESSES_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/mass-upload/`,
    DEACTIVATING_ADDRESSES_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/deactivate`,
    ACTIVATING_ADDRESSES_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/address/activate`,

    CREATE_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/add`,
    LIST_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/list/`,
    GET_CURRENCY_DETAILS_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/get-currency-details`,
    UPDATE_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/update`,
    UPLOAD_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/upload`,
    DEACTIVATE_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/deactivate/`,
    ACTIVATE_CURRENCY_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/currencies/activate/`,

    LIST_ALL_FEATURES: `${BASE_URL + AUTH_PREFIX}/dox/module`,
    LIST_ALL_CATEGORIES: `${BASE_URL + PRIVILEGES_PREFIX}/v1/categories`,
    USER_ACCESS_MATRIX: `${BASE_URL + PRIVILEGES_PREFIX}/v2/userPrivilege`,
    PERMISSIONS_OF_AN_USER: `${BASE_URL + AUTH_PREFIX}/{companyUuid}/{userUuid}/authorities`,
    GET_RESOURCES_UNDER_COMPANY: `${BASE_URL + AUTH_PREFIX}/{companyUuid}/authorities`,

    BATCH_UPLOAD_CATEGORY: `${BASE_ENTITIES}/{companyUuid}/category/upload`,

    GET_CONNECTIONS_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/connections/requests/`,
    GET_SENT_REQUEST_COMPANY_DETAILS_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/connections/request/company/`,
    REJECT_CONNECTION_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/connections/rejected/`,
    ACCEPT_CONNECTION_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/connections/accepted/`,
    CANCEL_CONNECTION_URL: `${BASE_URL + ENTITIES_PREFIX}/{companyUuid}/connections/cancelled/`,

    GET_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/list-uom-record?companyUuid=`,
    BATCH_UPLOAD_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/batch-processing-uom-records?companyUuid=`,
    CREATE_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/create-uom-record`,
    UPDATE_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/update-uom-record`,
    MASS_DEACTIVATE_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/deactivate-uom-records?companyUuid=`,
    MASS_ACTIVATE_UOM_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/activate-uom-records?companyUuid=`,
    GET_UOM_DETAILS: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/get-uom-record`,

    /* GL URLs CONFIGURATION */
    CREATE_GL_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/create-gl-account`,
    LIST_GL_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/list-gl-accounts?companyUuid=`,
    UPDATE_GL_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/update-gl-account`,
    BATCH_UPLOAD_GL_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/batch-processing-gl-accounts?companyUuid=`,
    GET_GL_DETAILS: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/get-gl-account`,
    ACTIVATE_GL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/activate-gl-accounts?companyUuid=`,
    DEACTIVATE_GL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/deactivate-gl-accounts?companyUuid=`,
    /* END GL URLs CONFIGURATION */

    CREATE_TAX_RECORD_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/create-tax-record`,
    LIST_TAX_RECORDS_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/list-tax-record`,
    UPDATE_TAX_RECORD_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/update-tax-record`,
    BATCH_UPLOAD_TAX_RECORDS: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/batch-processing-tax-records?companyUuid=`,
    DEACTIVATING_LIST_TAX_RECORDS_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/deactivate-tax-records`,
    ACTIVATING_LIST_TAX_RECORDS_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/activate-tax-records`,
    GET_TAX_RECORD_URL: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}${TRANSACTION_PREFIX}/get-tax-record`,

    CREATE_CATALOGUE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/add`,
    LIST_CATALOGUES_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/list`,
    LIST_CATALOGUES_V2_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/v2/list/feature`,
    LIST_CATALOGUES_V2_MANAGE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/v2/list`,
    LIST_MANUAL_CATALOGUES_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/listManual`,
    GET_CATALOGUE_DETAILS_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/get-catalogue-details`,
    UPDATE_CATALOGUE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/update/{uuid}`,
    BATCH_UPLOAD_CATALOGUES: `${BASE_ENTITIES}/{companyUuid}/catalogue/upload`,
    DEACTIVATE_CATALOGUES_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/deactivate/`,
    ACTIVATE_CATALOGUES_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/activate/`,
    AUDIT_TRAIL_CATALOGUE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/get-catalogue-price-audit-trail`,
    GET_SPECIAL_CATALOGUE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/special/details?projectCode={projectCode}`,
    GET_CATALOGUE_DETAILS_BY_ITEM_CODE_URL: `${BASE_ENTITIES}/{companyUuid}/catalogue/item-code/{itemCode}`,

    GET_PROJECT_TRADE: `${BASE_URL}entities/{companyUuid}/transactional-setting/get-project-trades`,
    LIST_PROJECT_TRADES: `${BASE_URL}entities/{companyUuid}/transactional-setting/list-project-trades`,
    CREATE_PROJECT_TRADE_URL: `${BASE_URL}entities/{companyUuid}/transactional-setting/create-project-trade`,
    UPDATE_PROJECT_TRADE_API: `${BASE_URL}entities/{companyUuid}/transactional-setting/update-project-trade`,
    DEACTIVATING_LIST_PROJECT_TRADE_URL: `${BASE_URL}entities/{companyUuid}/transactional-setting/deactivate-project-trades`,
    ACTIVATING_LIST_PROJECT_TRADE_URL: `${BASE_URL}entities/{companyUuid}/transactional-setting/activate-project-trades`,
    MASS_UPLOAD_PROJECT_TRADE_URL: `${BASE_URL}entities/{companyUuid}/transactional-setting/batch-processing-project-trades`,

    CREATE_AND_UPDATE_PERMISSION_FOR_ONE_USER: `${BASE_URL + AUTH_PREFIX}/subadmin/update`,
    LIST_ALL_THE_USER_PERMISSION_WITHIN_A_COMPANY: `${BASE_URL + AUTH_PREFIX}/subadmin/list?uuid=`,

    GET_RETRIEVE_ALL_SUPPLIERS_UNDER_COMPANY: `${BASE_ENTITIES}/{companyUuid}/suppliers/list/`,
    GET_RETRIEVE_SUPPLIERS_DETAILS: `${BASE_ENTITIES}/{companyUuid}/suppliers/details/{supplierUuid}`,

    /** MANAGE PROJECT URLs */
    LIST_PROJECT_URL: `${BASE_ENTITIES}/{companyUuid}/projects/list`,
    PROJECT_DETAIL_URL: `${BASE_ENTITIES}/{companyUuid}/projects/get-project-details/{projectCode}`,
    PROJECT_FORECAST_DETAIL_URL: `${BASE_ENTITIES}/{companyUuid}/project-forecast/details/{projectCode}`,
    PROJECT_FORECAST_SAVE_URL: `${BASE_ENTITIES}/{companyUuid}/project-forecast/save`,
    PROJECT_CLOSE: `${BASE_ENTITIES}/{companyUuid}/projects/close/{projectCode}`,
    /** END OF MANAGE PROJECT URLs */

    /** MANAGE EXTERNAL VENDORS */
    LIST_EXT_VENDOR_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/list`,
    CREATE_EXT_VENDOR_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/create`,
    CREATE_EXT_VENDOR_NO_CONNECT_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/create/no-connect`,
    UPDATE_EXT_VENDOR_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/update`,
    DISCONNECT_SUPPLIER_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/disconnect/{supplierUuid}`,
    RECONNECT_SUPPLIER_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/reconnect`,
    UPLOAD_SUPPLIER: `${BASE_ENTITIES}/{companyUuid}/suppliers/mass-upload`,
    GET_DETAIL_EXT_VENDOR_URL: `${BASE_ENTITIES}/{companyUuid}/suppliers/details/{uuid}`,
    GET_DETAIL_EXT_VENDOR_URL_FOR_SUPPLIER: `${BASE_ENTITIES}/{companyUuid}/buyer/details/{uuid}`,
    CREATE_AND_CONNECT_EXT_VENDOR_URL: `${BASE_ENTITIES}/{companyUuid}/connections/accepted`,
    CREATE_EXT_VENDOR_AND_ACCEPT_CONNECTION_URL: `${BASE_ENTITIES}/{companyUuid}/connections/accepted/{connectionUuid}`,
    /** END MANAGE EXTERNAL VENDORS */

    /** MANAGE PAYMENT TERM */
    LIST_PAYMENT_TERM_URL: `${BASE_ENTITIES}/{companyUuid}/payment-term/list`,
    CREATE_PAYMENT_TERM_URL: `${BASE_ENTITIES}/{companyUuid}/payment-term/create`,
    GET_DETAILS_PAYMENT_TERM_URL: `${BASE_ENTITIES}/{companyUuid}/payment-term/details/{ptUuid}`,
    UPDATE_PAYMENT_TERM_URL: `${BASE_ENTITIES}/{companyUuid}/payment-term/update`,
    /** END MANAGE PAYMENT TERM */

    /** MANAGE APPROVAL GROUP */
    LIST_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/list`,
    CREATE_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/create`,
    GET_DETAILS_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/details/{groupUuid}`,
    UPDATE_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/edit`,
    MASS_UPLOAD_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/mass-upload`,
    ACTIVATE_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/activate`,
    DEACTIVATE_APPROVAL_GROUP_URL: `${BASE_ENTITIES}/{companyUuid}/group/deactivate`,
    /** END MANAGE APPROVAL GROUP */

    /** MANAGE AP SPECIALIST */
    LIST_AP_SPECIALIST_URL: `${BASE_ENTITIES}/{companyUuid}/ap-specialist/list`,
    /** END MANAGE AP SPECIALIST */

    /** MANAGE BANK ACCOUNT */
    LIST_BANK_ACCOUNT_URL: `${BASE_ENTITIES}/{companyUuid}/bank-account/list`,
    /** END MANAGE BANK ACCOUNT */

    /* PRE-REQUISITION - APIs */
    PPR_API,
    /* END PRE-REQUISITION - APIs */

    /* MANAGE PROJECT - APIs */
    MANAGE_PROJECT_API,
    /*  */

    /* APPROVAL MATRIX MANAGEMENT - APIs */
    APPROVAL_MATRIX_MANAGEMENT_API,
    /*  */

    /* MANAGE PROJECT FORECAST */
    MANAGE_PROJECT_FORECAST_API,

    /* MEDIA */
    MEDIA_API,

    /* APP ROUTING */
    LIST_ORGANIZATION_USERS: "/organization/users/list",
    LIST_COMPANY_USERS: "/company/users",

    CREATE_ENTITY: "/create-entity",
    LIST_ENTITIES: "/entities",
    ENTITY_DETAILS: "/entity-details?uuid=",

    CREATE_COMPANY: "/create-company",
    LIST_COMPANIES: "/companies",
    COMPANY_DETAILS: "/company-details?uuid=",

    LIST_ADDRESSES: "/company/addresses",
    CREATE_ADDRESS: "/company/create-address",
    ADDRESS_DETAILS: "/company/address-details?uuid=",

    CREATE_CURRENCY: "/create-currency",
    LIST_CURRENCIES: "/currencies",
    CURRENCY_DETAILS: "/currency-details?uuid=",

    CREATE_CONNECTION: "/create-connection",
    LIST_CONNECTION: "/connections",
    CONNECTION_DETAILS: "/connections/connection-details?uuid=",

    LIST_UOM: "/uom/list",
    CREATE_UOM: "/create-uom",
    UOM_DETAILS: "/uom/details?uuid=",

    LIST_GL: "/gls",
    CREATE_GL: "/create-gl",
    GL_DETAILS: "/gl-details?uuid=",

    LIST_TAX_RECORDS: "/tax-records",
    CREATE_TAX_RECORD: "/create-tax-record",
    UPDATE_TAX_RECORD: "/tax-record-details?uuid=",

    CREATE_CATALOGUE: "/manage-catalogue/create",
    LIST_CATALOGUES: "/manage-catalogue",
    CATALOGUE_DETAILS: "/manage-catalogue/details?uuid=",

    LIST_MANAGE_PROJECT_TRADE: "/list-trade-code",
    CREATE_PROJECT_TRADE: "/create-trade-code",
    UPDATE_PROJECT_TRADE: "/trade-code-details?uuid=",

    MANAGE_ADMIN_MATRIX: "/manage-admin-matrix",
    /* PRE-REQUISITION - App Routing */
    PPR_ROUTING,
    /* END PRE-REQUISITION - App Routing */

    /** MANAGE PROJECT FORECAST ROUTEs */

    LIST_PROJECT_FORECAST: "/list-project-forecast",
    PROJECT_FORECAST: "/list-project-forecast/forecast",
    UPDATE_PROJECT_FORECAST: "/list-project-forecast/details?projectCode=",

    /** END OF MANAGE PROJECT FORECAST ROUTEs */

    /** MANAGE PROJECT ROUTEs */

    LIST_EXT_VENDOR: "/list-ext-vendor",
    CREATE_EXT_VENDOR: "/external-vendor/create",
    VENDOR_EXT_DETAILS: "/external-vendor/details?uuid=",

    /** END OF MANAGE PROJECT ROUTEs */

    /** MANAGE PAYMENT TERM ROUTEs */
    LIST_PAYMENT_TERMS: "/payment-terms",
    CREATE_PAYMENT_TERM: "/create-payment-terms",
    PAYMENT_TERM_DETAILS: "payment-term-details?uuid=",
    /** END OF MANAGE PAYMENT TERMS ROUTEs */

    /** MANAGE APPROVAL GROUP ROUTEs */
    LIST_APPROVAL_GROUPS: "/approval-groups",
    CREATE_APPROVAL_GROUPS: "/create-approval-groups",
    APPROVAL_GROUPS_DETAILS: "/details-approval-groups?uuid=",
    /** END OF MANAGE APPROVAL GROUP ROUTEs */

    /** MANAGE APPROVAL MATRIX ROUTEs */
    LIST_APPROVAL_MATRIX: "/approval-matrix/list",
    CREATE_APPROVAL_MATRIX: "/approval-matrix/create",
    APPROVAL_MATRIX_DETAILS: "/approval-matrix/details",
    /** END OF MANAGE APPROVAL MATRIX ROUTEs */

    /* MANAGE FEATURES MATRX */
    FEATURES_MATRIX_ROUTES,
    /* END OF MANAGE FEATURES MATRX */

    /* MANAGE DOCUMENT PREFIX */
    DOCUMENT_PREFIX_ROUTES,
    /* END OF DOCUMENT PREFIX */

    /* CONTRACT MODULE URL */
    LIST_CONTRACT_REQUEST_RECORDS: "/contract-request/list",
    /* END OF CONTRACT MODULE URL */

    /* MANAGE DEVELOPER WORK REQUEST */
    DW_REQUEST_ROUTES,
    /* END OF MANAGE DEVELOPER WORK REQUEST */

    MANAGE_DOCUMENT_TEMPLATE: "/document-template",

    /* MANAGE PAYMENT CYCLES */
    LIST_OF_PAYMENT_CYCLES: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/list`,
    GET_PAYMENT_CYCLE_DETAILS: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/details/{paymentCycleUuid}`,
    MASS_UPLOAD_PAYMENT_CYCLE: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/mass-upload`,
    CREATE_PAYMENT_CYCLE: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/create`,
    UPDATE_PAYMENT_CYCLE: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/edit`,
    ACTIVATE_PAYMENT_CYCLE: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-cycle/activate`,
    LIST_OF_PAYMENT_SETTING: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-setting`,
    PAYMENT_SETTING_ENTITY: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-setting/entity`,
    SET_DEFAULT_PAYMENT_SETTING: `${BASE_URL}${ENTITIES_PREFIX}/{companyUuid}/payment-setting`,

    /* END OF MANAGE PAYMENT CYCLES */

    PROGRESSIVE_ROUTES,

    BANK_ACCOUNT_ROUTES_PATH,

    SUPPLIER_BANK_ACCOUNT_ROUTES_PATH
};

Object.freeze(URL_CONFIG);
export default URL_CONFIG;
