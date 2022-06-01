import * as actionTypes from "./types/projectTradeActionTypes";
import ManageProjectTradeService from "../services/ManageProjectTradeService";

// CREATE ACTION
export const createProjectTradeSuccess = () => ({
    type: actionTypes.CREATE_PROJECT_TRADE_SUCCESSFUL,
    message: { value: "Success", type: "Success" }
});

export const createProjectTradeError = () => ({
    type: actionTypes.CREATE_PROJECT_TRADE_ERROR,
    message: { value: "Error", type: "Error" }
});

export const createProjectTradeItems = (projectTrade) => (dispatch) => {
    ManageProjectTradeService.createProjectTrade(projectTrade)
        .then((res) => {
            dispatch(createProjectTradeSuccess(res.msg));
        })
        .catch((error) => {
            dispatch(createProjectTradeError(error.msg));
        });
};

// GETTING ACTION
export const gettingProjectTradeSuccess = (data) => ({
    type: actionTypes.GETTING_PROJECT_TRADE_SUCCESSFUL,
    manageProjectTrade: data
});

export const gettingProjectTradeError = () => ({
    type: actionTypes.GETTING_PROJECT_TRADE_ERROR,
    message: { value: "Error", type: "Error" }
});

export const getProjectTradeItems = (companyUuid) => (dispatch) => {
    ManageProjectTradeService.getListProjectTrade(companyUuid)
        .then((res) => {
            dispatch(gettingProjectTradeSuccess(res.data));
        })
        .catch((error) => {
            dispatch(gettingProjectTradeError(error.msg));
        });
};
