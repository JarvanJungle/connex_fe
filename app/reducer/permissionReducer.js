import { getFromLS } from "helper/utilities";
import { FEATURE_ROUTE_BASED } from "helper/constantsDefined";
import * as actionTypes from "../actions/types/permissionTypes";

const initialState = {
    loading: false,
    userPermission: {
        USER: [],
        ADMIN: []
    },
    // currentCompanyUUID: "",
    currentCompany: null,
    isBuyer: null, // we need this one to store the state after browser reloaded
    errorMessage: "",
    featureBasedOn: "",
    currentCategory: getFromLS(FEATURE_ROUTE_BASED.CURRENT_CATEGORY) || "Dashboard"
};

export const permissionReducer = (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.GETTING_PERMISSION:
        return {
            ...state,
            loading: true
        };
    case actionTypes.GETTING_PERMISSION_SUCCESSFUL:
        return {
            ...state,
            userPermission: action.userPermission,
            featureBasedOn: action.featureBasedOn,
            currentCompany: action.currentCompany,
            isBuyer: action.isBuyer,
            loading: false
        };
    case actionTypes.GETTING_PERMISSION_ERROR:
        return {
            ...state,
            errorMessage: action.errorMessage,
            loading: false
        };
    case actionTypes.SET_PERMISSION_CURRENT_CATE:
        return {
            ...state,
            currentCategory: action.currentCategory
        };
    case actionTypes.SET_PERMISSION_FEATURE_BASED:
        return {
            ...state,
            featureBasedOn: action.featureBasedOn
        };
    case actionTypes.SET_IS_BUYER:
        return {
            ...state,
            isBuyer: action.isBuyer
        };
    default:
        return state;
    }
};

export default permissionReducer;
