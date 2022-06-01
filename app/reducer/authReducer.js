import * as actionTypes from "../actions/types/authTypes";

const initialState = {
    logout: false,
    userDetails: {},
    errorMessage: "",
    loading: false,
    redirectTo: ""
};

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.GETTING_USER_DETAILS:
        return {
            ...state,
            loading: true
        };
    case actionTypes.GETTING_USER_DETAILS_SUCCESSFUL:
        return {
            ...state,
            userDetails: action.userDetails,
            redirectTo: "/dashboard",
            loading: action.loading
        };
    case actionTypes.GETTING_USER_DETAILS_ERROR:
        return {
            ...state,
            errorMessage: action.errorMessage,
            loading: false
        };
    case actionTypes.CHANGE_LOGOUT:
        return {
            ...state,
            logout: action.logout
        };
    default:
        return state;
    }
};

export default authReducer;
