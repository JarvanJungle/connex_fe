import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar, SidebarTrigger } from "components";
import SidebarTopA from "routes/components/Sidebar/SidebarTopA";
import { SidebarBottomA } from "routes/components/Sidebar/SidebarBottomA";
import RouteService from "services/routes";
import { StyledContainer } from "theme/StyledComponent/StyledContainer";
import { setToLS } from "helper/utilities";
import { FEATURE_ROUTE_BASED, ROLES } from "helper/constantsDefined";
import { getUserPermission } from "actions/permissionActions";
import { useDispatch } from "react-redux";
import { FEATURE } from "helper/constantsDefined";
import _ from "lodash";
import { usePermission } from "routes/hooks";
import { SidebarCompany } from "./SidebarCompany";
import SidebarMiddleNav from "./SidebarMiddleNav";

const DefaultSidebar = () => {
    const [data, setData] = useState({
        items: [], companies: []
    });

    const DOXA_COLORS = {
        GREEN: "#AEC57D",
        PURPLE: "#A9A2C1",
        PEACH: "#F8A186"
    };

    const [backgroundColor, setBackgroundColor] = useState(DOXA_COLORS.PURPLE);
    const history = useHistory();
    const dispatch = useDispatch();
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer, currentCompany } = permissionReducer;
    const rawFeaturePR = usePermission(FEATURE.PR);
    const rawFeatureDWR = usePermission(FEATURE.DWR);
    const rawFeaturePO = usePermission(FEATURE.PO);
    const rawFeatureRFQ = usePermission(FEATURE.RFQF);
    const rawFeatureDO = usePermission(FEATURE.DO);
    const rawFeaturePPR = usePermission(FEATURE.PPR);
    const rawFeatureGR = usePermission(FEATURE.GR);
    const rawFeatureInvoice = usePermission(FEATURE.INV);
    const rawFeatureCN = usePermission(FEATURE.CREDIT_NOTE);
    const rawFeatureSubEntities = usePermission(FEATURE.SUB_ENTITY);
    const rawFeaturePendingPayment = usePermission(FEATURE.MPAYM);
    const rawFeatureAPList = usePermission(FEATURE.MPAYM);

    const [companyLogo, setCompanyLogo] = useState();

    const getItems = () => {
        if (permissionReducer.currentCategory === "Dashboard") {
            setData((prevStates) => ({
                ...prevStates,
                items: authReducer?.userDetails?.roles?.includes(ROLES.DOXA_ADMIN)
                    ? RouteService.getRouteForDOXAAdmin()
                    : null
            }));
        } else {
            const rawRoot = permissionReducer
                .userPermission[permissionReducer.featureBasedOn]
                .routes[permissionReducer.currentCategory];
            console.log("rawRoot", rawRoot);
            let flexibleRoute = RouteService.getRoutes(
                rawRoot
            );

            // Hide Raise PR from viewer
            if (
                rawFeaturePR && rawFeatureDWR
                && (rawFeaturePR?.read && !rawFeaturePR?.write)
                && (!rawFeatureDWR?.write && !rawFeatureDWR?.read)
            ) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "requisitions") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "raise-requisition");
                    }
                });
            }

            // Hide PRs To Be Converted from viewer
            if (rawFeaturePO && rawFeaturePO?.read && !rawFeaturePO?.write) {
                flexibleRoute = flexibleRoute.filter((item) => item.id !== "requests-pending-conversion");
            }

            // Hide Raise RFQ from viewer
            if (rawFeatureRFQ && rawFeatureRFQ?.read && !rawFeatureRFQ?.write) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "rfq") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "raise-rfq");
                    }
                });
            }

            // Hide Create DO from viewer
            if (rawFeatureDO && !rawFeatureDO.write) {
                flexibleRoute = flexibleRoute.filter((item) => item.id !== "doc");
            }

            // Hide Create PPR from viewer
            if (rawFeaturePPR && !rawFeaturePPR.write) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "pre-requisitions") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "raise-pre-requisitions");
                    }
                });
            }

            // Hide Create GR from viewer
            if (rawFeatureGR && !rawFeatureGR.write) {
                flexibleRoute = flexibleRoute.filter((item) => (item.id !== "crfd" && item.id !== "crfp" && item.id !== "cnor"));
            }

            // Hide Create INV from viewer
            if (rawFeatureInvoice && !rawFeatureInvoice.write) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "invoices") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "ci");
                    }
                });
            }

            // Hide Create CN from viewer
            if (rawFeatureCN && !rawFeatureCN.write) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "credit-notes") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "ccn");
                    }
                });
            }
            // Hide Create Company from viewer
            if (rawFeatureSubEntities && !rawFeatureSubEntities.write) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === 3) {
                        flexibleRoute[index].children = item.children
                            .filter((child) => child.id !== 1);
                    }
                });
            }
            // Hide Pending Payment from viewer
            if (rawFeaturePendingPayment && !rawFeaturePendingPayment.write
                && rawFeaturePendingPayment.approve) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "mpaym") {
                        flexibleRoute[index].children = item.children
                            .filter((child) => child.id !== "pp");
                    }
                });
            }
            // Hide Approved Payment List from viewer
            if (rawFeatureAPList && !rawFeatureAPList.write
                && rawFeatureAPList.approve) {
                flexibleRoute.forEach((item, index) => {
                    if (item.id === "hpaym") {
                        flexibleRoute[index].children = item.children
                            .filter((child) => child.id !== "apl");
                    }
                });
            }
            if (!isBuyer) {
                flexibleRoute.forEach((item, index) => {
                    // Pending Approval Invoice
                    if (item.id === "invoices") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "pai");
                    }
                    // PRs To Be Converted
                    if (item.id === "requests-pending-conversion") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // Pre-PO List
                    if (item.id === "orderslist") {
                        flexibleRoute[index].children = item.children.filter((child) => child.id !== "ppl");
                    }
                    // Manual Payment
                    if (item.id === "mpaym") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // H2H Payment
                    if (item.id === "hpaym") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // GR
                    if (item.id === "rl") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    if (item.id === "crfd") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    if (item.id === "crfp") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    if (item.id === "cnor") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // RFQ Pricing
                    if (item.id === "rfq") {
                        // hide Raise RFQ
                        // flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                        const rfq = flexibleRoute.find((backup) => backup.id === item.id);
                        const { children } = rfq;
                        const newChildren = children.filter((element) => element.id !== "raise-rfq");
                        rfq.children = newChildren;
                        flexibleRoute[index] = rfq;
                    }
                    // PPR
                    if (item.id === "pre-requisitions") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // PR
                    if (item.id === "requisitions") {
                        flexibleRoute = flexibleRoute.filter((backup) => backup.id !== item.id);
                    }
                    // Contract
                    if (item.id === "contract") {
                        flexibleRoute[index].children = flexibleRoute?.[index]?.children?.filter((e) => !["contract-request-submit", "contract-request-listing"].includes(e.id));
                    }
                });
                console.debug(flexibleRoute);
            } else if (isBuyer) {
                flexibleRoute.forEach((route) => {
                    // DO
                    if (route.id === "dol") {
                        flexibleRoute = flexibleRoute.filter((item) => item.id !== route.id);
                    }
                    if (route.id === "doc") {
                        flexibleRoute = flexibleRoute.filter((item) => item.id !== route.id);
                    }
                });
            }
            flexibleRoute = _.uniqBy(flexibleRoute, "id");
            console.log("flexibleRoute", flexibleRoute);
            setData((prevStates) => ({
                ...prevStates,
                items: flexibleRoute
            }));
        }
    };

    const getCompanies = () => {
        setData((prevStates) => ({
            ...prevStates,
            companies: authReducer.userDetails.companies
        }));
    };

    const updateBackgroundColor = () => {
        if (!permissionReducer.isBuyer) {
            setBackgroundColor(DOXA_COLORS.PURPLE);
        } else {
            setBackgroundColor(DOXA_COLORS.GREEN);
        }
        if (permissionReducer.featureBasedOn === "ADMIN") {
            setBackgroundColor(DOXA_COLORS.PEACH);
        }
    };

    useEffect(() => {
        if (authReducer && authReducer?.userDetails?.companies?.length > 0
            && permissionReducer && permissionReducer?.currentCompany
        ) {
            getCompanies();
            getItems();
            updateBackgroundColor();
        }
    }, [authReducer, permissionReducer]);

    useEffect(() => {
        if (!_.isEmpty(currentCompany)) {
            setCompanyLogo(currentCompany.logoUrl);
        }
    }, [currentCompany]);

    const onChangeCompany = (companyUuid) => {
        setToLS(FEATURE_ROUTE_BASED.CURRENT_COMPANY, companyUuid);
        const { companies, uuid } = authReducer.userDetails;
        const currentCompanyObj = companies.find((x) => x.companyUuid === companyUuid);
        setToLS("companyRole", currentCompanyObj);
        setCompanyLogo(currentCompanyObj.logoUrl);
        dispatch(getUserPermission(currentCompanyObj, uuid));
        console.log("onChangeCompany");
        localStorage.setItem("companyRole", JSON.stringify(currentCompanyObj));
        history.push("/dashboard");
    };

    return (
        <Sidebar>
            { /* START SIDEBAR-OVERLAY: Close (x) */}
            <Sidebar.Close>
                <SidebarTrigger tag="a" href="#">
                    <i className="fa fa-times-circle fa-fw" />
                </SidebarTrigger>
            </Sidebar.Close>
            { /* START SIDEBAR-OVERLAY: Close (x) */}

            { /* START SIDEBAR: Only for Mobile */}
            <Sidebar.MobileFluid>
                <StyledContainer backgroundColor={backgroundColor}>
                    <SidebarTopA />
                </StyledContainer>
                <SidebarCompany
                    onChangeCompany={onChangeCompany}
                    companies={data.companies}
                    companyLogo={companyLogo}
                />
                <Sidebar.Section fluid cover>
                    { /* SIDEBAR: Menu */}
                    <SidebarMiddleNav
                        items={data.items}
                        userDetails={userDetails}
                        permissionReducer={permissionReducer}
                    />
                </Sidebar.Section>
                <SidebarBottomA />
            </Sidebar.MobileFluid>
            { /* END SIDEBAR: Only for Mobile */}
        </Sidebar>
    );
};

export default DefaultSidebar;
