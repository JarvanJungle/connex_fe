import { BASE_URL } from "../urlConfig/urlConfig";

const BANK_ACCOUNT_API = {
    LIST_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/list`,
    LIST_BANK_NAME_URL: `${BASE_URL}entities/{companyUuid}/bank-account/list-bank`,
    CREATE_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/create`,
    UPDATE_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/edit/{bankAccountUuid}`,
    APPROVE_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/approve`,
    REJECT_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/reject`,
    GET_BANK_ACCOUNT_DETAILS_URL: `${BASE_URL}entities/{companyUuid}/bank-account/details/{bankAccountUuid}`,
    MASS_UPLOAD_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/bank-account/mass-upload`
};

export const SUPPLIER_BANK_ACCOUNT_API = Object.freeze({
    LIST_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/list`,
    LIST_BANK_NAME_URL: `${BASE_URL}entities/{companyUuid}/bank-account/list-bank`,
    CREATE_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/create`,
    UPDATE_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/edit/{bankAccountUuid}`,
    APPROVE_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/approve/{uuid}`,
    REJECT_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/reject/{uuid}`,
    GET_SUPPLIER_BANK_ACCOUNT_DETAILS_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/details/{bankAccountUuid}`,
    MASS_UPLOAD_SUPPLIER_BANK_ACCOUNT_URL: `${BASE_URL}entities/{companyUuid}/supplier-bank-account/mass-upload`
});

Object.freeze(BANK_ACCOUNT_API);
export default BANK_ACCOUNT_API;
