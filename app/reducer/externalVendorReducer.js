import * as actionTypes from "../actions/types/externalVendorActionTypes";

const initialState = {
    externalVendors: [],
    uuidSupplierDisconnect: "",
    externalVendorsFilter: [],
    showConfirmDisconnectionDialog: false,
    showConfirmReconnectionDialog: false,
    paymentTerms: [],
    bankAccounts: [],
    gridApi: null,
    supplierUuid: "",
    externalVendorDetail: {},
    listOfContactPerson: [],
    rowContactPersonEdit: "",
    message: {
        value: "",
        type: "",
        action: ""
    },
    loading: true,
    isEdit: false,
    isCreate: false
};

export const externalVendorReducer = (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.ACTIVATE_LOADING:
        return {
            ...state,
            loading: true
        };
    case actionTypes.GETTING_EXTERNAL_VENDOR_SUCCESSFUL:
        return {
            ...state,
            externalVendors: action.payload,
            loading: false
        };
    case actionTypes.GETTING_EXTERNAL_VENDOR_ERROR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.SETTING_GRID_API:
        return {
            ...state,
            gridApi: action.payload
        };
    case actionTypes.SHOW_CONFIRM_DISCONNECT_DIALOG:
        return {
            ...state,
            showConfirmDisconnectionDialog: true
        };
    case actionTypes.CLOSE_CONFIRM_DISCONNECT_DIALOG:
        return {
            ...state,
            showConfirmDisconnectionDialog: false
        };
    case actionTypes.SHOW_CONFIRM_RECONNECT_DIALOG:
        return {
            ...state,
            showConfirmReconnectionDialog: true
        };
    case actionTypes.CLOSE_CONFIRM_RECONNECT_DIALOG:
        return {
            ...state,
            showConfirmReconnectionDialog: false
        };
    case actionTypes.GETTING_PAYMENT_TERM_SUCCESSFUL:
        return {
            ...state,
            paymentTerms: action.payload
        };
    case actionTypes.GETTING_PAYMENT_TERM_ERROR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.GETTING_BANK_ACCOUNT_SUCCESSFUL:
        return {
            ...state,
            bankAccounts: action.payload
        };
    case actionTypes.GETTING_BANK_ACCOUNT_ERROR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.CREATING_EXTERNAL_VENDOR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.DISCONNECT_SUPPLIER_SUCCESSFUL:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.DISCONNECT_SUPPLIER_ERROR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.SETTING_UUID_SUPPLIER_DISCONNECT:
        return {
            ...state,
            uuidSupplierDisconnect: action.payload
        };
    case actionTypes.FILTER_BUYER_AND_SELLER:
        return {
            ...state,
            externalVendorsFilter: action.payload
        };
    case actionTypes.GETTING_VENDOR_DETAIL_SUCCESSFUL:
        return {
            ...state,
            externalVendorDetail: action.payload
        };
    case actionTypes.GETTING_VENDOR_DETAIL_ERROR:
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    case actionTypes.UPDATE_STATE: {
        return {
            ...state,
            ...action.payload
        };
    }
    case actionTypes.RECONNECT_SUPPLIER_SUCCESSFUL: {
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    }
    case actionTypes.RECONNECT_SUPPLIER_ERROR: {
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    }
    case actionTypes.UPDATE_SUPPLIER_DETAIL_SUCCESSFUL: {
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    }
    case actionTypes.UPDATE_SUPPLIER_DETAIL_ERROR: {
        return {
            ...state,
            message: action.payload,
            loading: false
        };
    }
    default
        :
        return state;
    }
};

export default externalVendorReducer;
