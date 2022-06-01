import { combineReducers } from "redux";
import { projectTradeReducer } from "./projectTradeReducer";
import { authReducer } from "./authReducer";
import { permissionReducer } from "./permissionReducer";
import { externalVendorReducer } from "./externalVendorReducer";

export default combineReducers({
    projectTradeReducer,
    authReducer,
    permissionReducer,
    externalVendorReducer
});
