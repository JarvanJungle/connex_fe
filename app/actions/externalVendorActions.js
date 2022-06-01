/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { BANK_ACCOUNT_STATUS } from "routes/EntityAdmin/ManageBankAccount/helper";
import * as actionTypes from "./types/externalVendorActionTypes";
import ExtVendorService from "../services/ExtVendorService";
import PaymentTermService from "../services/PaymentTermService";
import BankAccountService from "../services/BankAccountService/BankAccountService";

// SETTING GRID API
export const settingGridApi = (api) => ({
    type: actionTypes.SETTING_GRID_API,
    payload: api
});

// GETTING ACTION
export const gettingExternalVendorsSuccessful = (data) => ({
    type: actionTypes.GETTING_EXTERNAL_VENDOR_SUCCESSFUL,
    payload: data
});

export const gettingExternalVendorsError = (text) => ({
    type: actionTypes.GETTING_EXTERNAL_VENDOR_ERROR,
    payload: { value: text, type: "error", action: actionTypes.GETTING_EXTERNAL_VENDOR_ERROR }
});

export const getExternalVendors = (companyUuid) => (dispatch) => {
    dispatch({ type: actionTypes.ACTIVATE_LOADING });
    ExtVendorService.getExternalVendors(companyUuid)
        .then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                dispatch(gettingExternalVendorsSuccessful(res.data.data));
            } else {
                dispatch(gettingExternalVendorsError(res.data.message));
            }
        })
        .catch((error) => {
            dispatch(gettingExternalVendorsError(error.message));
        });
};

// GETTING PAYMENT TERM
export const gettingPaymentTermsSuccessful = (data) => ({
    type: actionTypes.GETTING_PAYMENT_TERM_SUCCESSFUL,
    payload: data
});

export const gettingPaymentTermsError = (text) => ({
    type: actionTypes.GETTING_PAYMENT_TERM_ERROR,
    payload: { value: text, type: "error", action: actionTypes.GETTING_PAYMENT_TERM_ERROR }
});

export const getAllPaymentTerms = (companyUuid) => (dispatch) => {
    PaymentTermService.getAllPaymentTerms(companyUuid)
        .then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                dispatch(gettingPaymentTermsSuccessful(res.data.data));
            } else {
                dispatch(gettingPaymentTermsError(res.data.message));
            }
        })
        .catch((error) => {
            dispatch(gettingPaymentTermsError(error.message));
        });
};

// GETTING BANK ACCOUNT
export const gettingBankAccountsSuccessful = (data) => ({
    type: actionTypes.GETTING_BANK_ACCOUNT_SUCCESSFUL,
    payload: data
});

export const gettingBankAccountsError = (text) => ({
    type: actionTypes.GETTING_BANK_ACCOUNT_ERROR,
    payload: { value: text, type: "error", action: actionTypes.GETTING_BANK_ACCOUNT_ERROR }
});

export const getAllBankAccount = (companyUuid) => (dispatch) => {
    BankAccountService.getAllBankAccount(companyUuid)
        .then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                const resBankAccount = res.data.data.filter((item) => item.status === BANK_ACCOUNT_STATUS.APPROVED);
                dispatch(gettingBankAccountsSuccessful(resBankAccount));
            } else {
                dispatch(gettingBankAccountsError(res.data.message));
            }
        })
        .catch((error) => {
            dispatch(gettingBankAccountsError(error.message));
        });
};

// CREATING EXTERNAL VENDOR
export const creatingExternalVendorSuccessful = (text) => ({
    type: actionTypes.CREATING_EXTERNAL_VENDOR,
    payload: { value: text, type: "success", action: actionTypes.CREATING_EXTERNAL_VENDOR }
});

export const creatingExternalVendorError = (text) => ({
    type: actionTypes.CREATING_EXTERNAL_VENDOR,
    payload: { value: text, type: "error", action: actionTypes.CREATING_EXTERNAL_VENDOR }
});

export const creatExternalVendor = (companyUuid, body) => (dispatch) => ExtVendorService.createExternalVendor(companyUuid, body);

export const createExternalVendorNonConnect = (companyUuid, body) => (dispatch) => ExtVendorService.createExternalVendorNonConnect(companyUuid, body);

export const createAndConnectExternalVendor = (companyUuid, body, connectionUuid) => (dispatch) => ExtVendorService.createAndConnectExternalVendor(companyUuid, body, connectionUuid);

// SHOW CONFIRM DIALOG
export const showConfirmDisconnectDialog = () => (dispatch) => {
    dispatch({ type: actionTypes.SHOW_CONFIRM_DISCONNECT_DIALOG });
};

// SHOW CONFIRM DIALOG
export const showConfirmReConnectDialog = () => (dispatch) => {
    dispatch({ type: actionTypes.SHOW_CONFIRM_RECONNECT_DIALOG });
};

export const closeConfirmDisconnectDialog = () => (dispatch) => {
    dispatch({ type: actionTypes.CLOSE_CONFIRM_DISCONNECT_DIALOG });
    // SAME LOGIC, DON'T CARE ABOUT FUNCTION NAME
    dispatch({ type: actionTypes.CLOSE_CONFIRM_RECONNECT_DIALOG });
};

// DISCONNECT SUPPLIER
export const disconnectSupplierSuccessful = (text) => ({
    type: actionTypes.DISCONNECT_SUPPLIER_SUCCESSFUL,
    payload: { value: text, type: "success", action: actionTypes.DISCONNECT_SUPPLIER }
});

export const disconnectSupplierError = (text) => ({
    type: actionTypes.DISCONNECT_SUPPLIER_ERROR,
    payload: { value: text, type: "error", action: actionTypes.DISCONNECT_SUPPLIER }
});

export const disconnectSupplier = (companyUuid, supplierUuid) => (dispatch) => ExtVendorService.disconnectSupplier(companyUuid, supplierUuid);

export const reConnectSupplier = (companyUuid, supplierUuid) => (dispatch) => ExtVendorService.disconnectSupplier(companyUuid, supplierUuid);

export const settingUuidSupplierDisconnect = (uuid) => (dispatch) => {
    dispatch({
        type: actionTypes.SETTING_UUID_SUPPLIER_DISCONNECT,
        payload: uuid
    });
};

// FILTER
export const filterSellerAndBuyer = (seller, buyer, listExtVendor) => (dispatch) => {
    const payload = listExtVendor.filter((vendor) => {
        if (seller && buyer) {
            return vendor.seller === seller && vendor.buyer === buyer;
        }
        if (!seller && buyer) {
            return vendor.buyer === buyer;
        }
        if (seller && !buyer) {
            return vendor.seller === seller;
        }
        return false;
    });

    dispatch({
        type: actionTypes.FILTER_BUYER_AND_SELLER,
        payload
    });
};

// GETTING VENDOR DETAIL
export const gettingVendorDetailSuccess = (data) => ({
    type: actionTypes.GETTING_VENDOR_DETAIL_SUCCESSFUL,
    payload: data
});

export const gettingVendorDetailError = (text) => ({
    type: actionTypes.GETTING_VENDOR_DETAIL_ERROR,
    payload: { value: text, type: "error", action: actionTypes.GETTING_VENDOR_DETAIL }
});

export const getVendorDetail = (companyUuid, supplierUuid) => (dispatch) => {
    ExtVendorService.getExternalVendorDetails(companyUuid, supplierUuid)
        .then((res) => {
            if (res.data.status === RESPONSE_STATUS.OK) {
                dispatch(gettingVendorDetailSuccess(res.data.data));
            } else {
                dispatch(gettingVendorDetailError(res.data.message));
            }
        })
        .catch((error) => {
            dispatch(gettingVendorDetailError(error.message));
        });
};

// UPDATE STATE
export const updateState = (key, value) => (dispatch) => {
    dispatch({
        type: actionTypes.UPDATE_STATE,
        payload: { [key]: value }
    });
};

// RECONNECT SUPPLIER
export const reconnectSupplierSuccessful = (text) => ({
    type: actionTypes.RECONNECT_SUPPLIER_SUCCESSFUL,
    payload: { value: text, type: "success", action: actionTypes.RECONNECT_SUPPLIER }
});

export const reconnectSupplierError = (text) => ({
    type: actionTypes.RECONNECT_SUPPLIER_ERROR,
    payload: { value: text, type: "error", action: actionTypes.RECONNECT_SUPPLIER }
});

export const reconnectSupplier = (companyUuid, body) => (dispatch) => ExtVendorService.reconnectSupplier(companyUuid, body);

// UPDATE SUPPLIER DETAIL
export const updateSupplierSuccessful = (text) => ({
    type: actionTypes.UPDATE_SUPPLIER_DETAIL_SUCCESSFUL,
    payload: { value: text, type: "success", action: actionTypes.UPDATE_SUPPLIER_DETAIL }
});

export const updateSupplierError = (text) => ({
    type: actionTypes.UPDATE_SUPPLIER_DETAIL_ERROR,
    payload: { value: text, type: "error", action: actionTypes.UPDATE_SUPPLIER_DETAIL }
});

export const updateSupplier = (companyUuid, body) => (dispatch) => ExtVendorService.updateExternalVendor(companyUuid, body);

// UPLOAD DATA VENDOR
export const uploadDataVendor = (companyUuid, body) => (dispatch) => ExtVendorService.uploadSupplier(companyUuid, body);
