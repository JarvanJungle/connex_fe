import { getFromLS, setToLS } from "helper/utilities";
import { FEATURE_ROUTE_BASED } from "helper/constantsDefined";
import * as actionTypes from "./types/permissionTypes";
import UserService from "../services/UserService";

// GETTING USER DETAILS
export const gettingUserPermission = () => ({
    type: actionTypes.GETTING_PERMISSION,
    loading: true
});

export const gettingUserPermissionSuccess = (data) => ({
    type: actionTypes.GETTING_PERMISSION_SUCCESSFUL,
    loading: false,
    userPermission: data.myFeatureRoot,
    currentCompany: data.currentCompany,
    isBuyer: data.isBuyer,
    featureBasedOn: getFromLS(FEATURE_ROUTE_BASED.LS_FEATURE_BASED_ON)
});

export const gettingUserPermissionError = (msg) => ({
    type: actionTypes.GETTING_PERMISSION_ERROR,
    loading: false,
    message: msg
});

function formatRoute(features) {
    const rootRoutes = {};
    const featureLength = features.length;
    if (featureLength === 0) return {};
    for (let i = 0; i < featureLength; i++) {
        if (rootRoutes[features[i].feature.category]) {
            rootRoutes[features[i].feature.category].push(features[i].feature);
        } else {
            rootRoutes[features[i].feature.category] = [features[i].feature];
        }
    }

    return rootRoutes;
}

export const updateCurrentCategoryMenu = (currentCategory) => ({
    type: actionTypes.SET_PERMISSION_CURRENT_CATE,
    currentCategory
});

export const updateFeatureBased = (featureBasedOn) => ({
    type: actionTypes.SET_PERMISSION_FEATURE_BASED,
    featureBasedOn
});

export const updateIsBuyer = (isBuyer) => ({
    type: actionTypes.SET_IS_BUYER,
    isBuyer
});

const validateIsBuyerFromLS = (companyObj) => {
    // get data from local storage
    const isBuyerLS = getFromLS(FEATURE_ROUTE_BASED.IS_BUYER);

    if (companyObj.buyer && companyObj.supplier
            && isBuyerLS && isBuyerLS !== "") {
        // if the getFromLS is null, the default will be a supplier
        return isBuyerLS;
    }

    // LS got null case
    setToLS(FEATURE_ROUTE_BASED.IS_BUYER, companyObj.buyer);
    return companyObj.buyer;
};

export const getUserPermission = (companyObj, userId) => (dispatch) => {
    dispatch(gettingUserPermission());
    const { companyUuid } = companyObj;
    UserService.getPermission(companyUuid, userId)
        .then(async (res) => {
            const userPermission = res.data.data;
            const lengthUserPermission = userPermission.length;
            const myFeatureRoot = {
                USER: {
                    features: [],
                    routes: {}
                },
                ADMIN: {
                    features: [],
                    routes: {}
                }
                // currentCompanyUUID: companyUuid,
            };

            for (let i = 0; i < lengthUserPermission; i++) {
                const myEl = userPermission[i];
                // check read permission
                if (myEl.actions.read) {
                    myFeatureRoot[myEl.feature.profile].features.push(myEl);
                }
            }

            const isFeatureBasedOnExist = getFromLS(FEATURE_ROUTE_BASED.LS_FEATURE_BASED_ON);
            if (!isFeatureBasedOnExist) {
                setToLS(FEATURE_ROUTE_BASED.LS_FEATURE_BASED_ON,
                    myFeatureRoot.USER.features.length > 0
                        ? FEATURE_ROUTE_BASED.USER
                        : FEATURE_ROUTE_BASED.ADMIN);
            }
            // set routes
            myFeatureRoot.USER.routes = formatRoute(myFeatureRoot.USER.features);
            if (myFeatureRoot.USER.routes?.Orders) {
                const foundEl = myFeatureRoot.USER.routes.Orders.find((x) => x.featureCode === "PO");

                if (foundEl) {
                    // need to remove in feature
                    const fixedObject = {
                        category: "Orders",
                        featureCode: "PrsToBeConverted",
                        featureName: "PRs To Be Converted",
                        moduleCode: "P2P",
                        profile: "USER",
                        subCategory: "Requests Pending Conversion"
                    };

                    const fixedObject2 = {
                        category: "Orders",
                        featureCode: "PPRsToBeConverted",
                        featureName: "PPRs To Be Converted",
                        moduleCode: "P2P",
                        profile: "USER",
                        subCategory: "Requests Pending Conversion"
                    };
                    myFeatureRoot.USER.routes.Orders.push(fixedObject);
                    myFeatureRoot.USER.routes.Orders.push(fixedObject2);
                }
            }
            myFeatureRoot.ADMIN.routes = formatRoute(myFeatureRoot.ADMIN.features);

            dispatch(gettingUserPermissionSuccess({
                myFeatureRoot,
                currentCompany: companyObj,
                isBuyer: validateIsBuyerFromLS(companyObj)
            }));
        })
        .catch((error) => {
            dispatch(gettingUserPermissionError(error.msg));
        });
};
