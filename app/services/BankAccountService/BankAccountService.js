import axios from "axios";
import BANK_ACCOUNT_API, { SUPPLIER_BANK_ACCOUNT_API } from "./url";

class BankAccountService {
    getAllBankAccount(companyUuid) {
        const url = BANK_ACCOUNT_API.LIST_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    getListBankName(companyUuid) {
        const url = BANK_ACCOUNT_API.LIST_BANK_NAME_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    postCreateBankAccount(companyUuid, body) {
        const url = BANK_ACCOUNT_API.CREATE_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    postUpdateBankAccount(companyUuid, body) {
        let url = BANK_ACCOUNT_API.UPDATE_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        url = url.replace("{bankAccountUuid}", body.uuid);
        return axios.post(url, body);
    }

    postApproveBankAccount(companyUuid, body) {
        const url = BANK_ACCOUNT_API.APPROVE_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    postRejectBankAccount(companyUuid, body) {
        const url = BANK_ACCOUNT_API.REJECT_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    getBankAccountDetails(companyUuid, bankAccountUuid) {
        const url = BANK_ACCOUNT_API.GET_BANK_ACCOUNT_DETAILS_URL.replace("{companyUuid}", companyUuid)
            .replace("{bankAccountUuid}", bankAccountUuid);
        return axios.get(url);
    }

    postMassUploadBankAccount(companyUuid, body) {
        const url = BANK_ACCOUNT_API.MASS_UPLOAD_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    // Supplier Bank Account
    getAllSupplierBankAccount(companyUuid) {
        const url = SUPPLIER_BANK_ACCOUNT_API.LIST_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.get(url);
    }

    postCreateSupplierBankAccount(companyUuid, body) {
        const url = SUPPLIER_BANK_ACCOUNT_API.CREATE_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }

    postUpdateSupplierBankAccount(companyUuid, body) {
        let url = SUPPLIER_BANK_ACCOUNT_API.UPDATE_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        url = url.replace("{bankAccountUuid}", body.uuid);
        return axios.post(url, body);
    }

    postApproveSupplierBankAccount(companyUuid, uuid, body) {
        const url = SUPPLIER_BANK_ACCOUNT_API.APPROVE_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", uuid);
        return axios.post(url, body);
    }

    postRejectSupplierBankAccount(companyUuid, uuid, body) {
        const url = SUPPLIER_BANK_ACCOUNT_API.REJECT_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid)
            .replace("{uuid}", uuid);
        return axios.post(url, body);
    }

    getSupplierBankAccountDetails(companyUuid, bankAccountUuid) {
        const url = SUPPLIER_BANK_ACCOUNT_API.GET_SUPPLIER_BANK_ACCOUNT_DETAILS_URL.replace("{companyUuid}", companyUuid)
            .replace("{bankAccountUuid}", bankAccountUuid);
        return axios.get(url);
    }

    postMassUploadSupplierBankAccount(companyUuid, body) {
        const url = SUPPLIER_BANK_ACCOUNT_API.MASS_UPLOAD_SUPPLIER_BANK_ACCOUNT_URL.replace("{companyUuid}", companyUuid);
        return axios.post(url, body);
    }
}

export default new BankAccountService();
