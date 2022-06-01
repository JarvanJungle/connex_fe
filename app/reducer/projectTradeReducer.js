import * as actionTypes from "../actions/types/projectTradeActionTypes";

const initialState = {
    manageProjectTrade: [],
    message: {
        value: "",
        type: ""
    },
    loading: true
};

export const projectTradeReducer = (state = initialState, action) => {
    switch (action.type) {
    case actionTypes.GETTING_PROJECT_TRADE_SUCCESSFUL:
        return {
            ...state,
            manageProjectTrade: action.manageProjectTrade,
            message: {
                value: "Successful ...",
                type: "success"
            },
            loading: false
        };
    case actionTypes.GETTING_PROJECT_TRADE_ERROR:
        return {
            ...state,
            message: {
                value: "Error ...",
                type: "error"
            },
            loading: false
        };
    default:
        return state;
    }
};

export default projectTradeReducer;
