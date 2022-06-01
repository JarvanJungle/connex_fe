import "@babel/polyfill";
import "../public/i18n";
import axios from "axios";
import React from "react";
import { Provider } from "react-redux";
import { render } from "react-dom";
// import { useHistory } from 'react-router-dom';
import { setToLS } from "helper/utilities";
import { LicenseManager } from "ag-grid-enterprise";
import UserService from "services/UserService";
// import { createStore, applyMiddleware } from "redux";
// import thunk from "redux-thunk";
// import logger from "redux-logger";
import { CookiesProvider, Cookies as ReactCookies } from "react-cookie";
import { WEB_STORAGE_KEY } from "helper/constantsDefined";
import store from "store";
import App from "./components/App";
import * as themes from "./theme/schema.json";
import { notification } from "./helper/utilities";
// import rootReducer from "./reducer";
import CONFIG from "./services/urlConfig";
// import { composeWithDevTools } from "redux-devtools-extension";

LicenseManager.setLicenseKey(process.env.REACT_APP_AG_GRID_KEY);
const cookies = new ReactCookies();
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            notification(
                "Notification",
                "Your session has ended, Please login again.",
                "error"
            ).then(() => {
                UserService.logout();
            });
        }
        throw error;
    }
);

axios.interceptors.request.use(
    (request) => {
        const freeTokenPaths = [CONFIG.SSO_GET_TOKEN];
        const token = cookies.get(process.env.SHARE_COOKIES_NAME);
        if (token && !freeTokenPaths.includes(request.url)) {
            request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
    },
    (error) => Promise.reject(error)
);

setToLS("all-themes", themes.default);

// use applyMiddleware to add the thunk middleware to the store

// const store = createStore(
//     rootReducer,
//     composeWithDevTools(applyMiddleware(thunk, logger))
// );

render(
    <Provider store={store}>
        <CookiesProvider>
            <App />
        </CookiesProvider>
    </Provider>,
    document.querySelector("#root")
);
