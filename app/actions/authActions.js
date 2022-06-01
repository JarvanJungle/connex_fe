import { setToLS } from "helper/utilities";
import { FEATURE_ROUTE_BASED } from "helper/constantsDefined";
import * as actionTypes from "./types/authTypes";
import UserService from "../services/UserService";
import { getUserPermission } from "./permissionActions";

// GETTING USER DETAILS
export const gettingUserDetails = () => ({
    type: actionTypes.GETTING_USER_DETAILS,
    loading: true
});

export const gettingUserDetailsSuccess = (data) => ({
    type: actionTypes.GETTING_USER_DETAILS_SUCCESSFUL,
    loading: false,
    userDetails: data
});

export const gettingUserDetailsError = (msg) => ({
    type: actionTypes.GETTING_USER_DETAILS_ERROR,
    loading: false,
    message: msg
});

export const changeLogout = (logout = false) => ({
    type: actionTypes.CHANGE_LOGOUT,
    logout
});

export const getUserDetails = () => (dispatch) => {
    dispatch(gettingUserDetails());
    UserService.getOwnUserDetails()
        .then((res) => {
            const userDetails = res.data.data;
            const userId = userDetails.uuid;
            const { companies } = userDetails;
            // will remove soon
            const currentCompany = companies.find((item) => item.main);
            localStorage.setItem("companyRole", JSON.stringify(currentCompany));
            localStorage.setItem("user", JSON.stringify(userDetails));

            const companyId = currentCompany.companyUuid;

            setToLS(FEATURE_ROUTE_BASED.CURRENT_COMPANY, companyId);

            dispatch(gettingUserDetailsSuccess(userDetails));
            dispatch(getUserPermission(currentCompany, userId));
        })
        .catch((error) => {
            dispatch(gettingUserDetailsError(error.msg));
        });
};

export const updateUserProfile = () => (dispatch) => {
    dispatch(gettingUserDetails());
    UserService.getOwnUserDetails()
        .then((res) => {
            const userDetails = res.data.data;
            dispatch(gettingUserDetailsSuccess(userDetails));
        })
        .catch((error) => {
            dispatch(gettingUserDetailsError(error.msg));
        });
};
