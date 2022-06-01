/* eslint-disable no-unused-vars */
import APP_ROUTES from "helper/commonConfig/routes";

class Routes {
    getRouteForDOXAAdmin() {
        const ROUTES = new APP_ROUTES();
        return ROUTES.entity;
    }

    getRoutes(rawRoot) {
        if (!rawRoot) return [];
        const ROUTES = new APP_ROUTES();
        let newRawRoot = [...rawRoot];
        const featureManualPayment = newRawRoot.find((item) => item?.featureCode === "MPAYM");
        const featureH2HPayment = newRawRoot.find((item) => item?.featureCode === "HPAYM");
        if (featureManualPayment && !featureH2HPayment) {
            const feature = Array.isArray(ROUTES.HPAYM) ? ROUTES.HPAYM : [ROUTES.HPAYM];
            newRawRoot = [...newRawRoot, ...feature];
        }
        if (!featureManualPayment && featureH2HPayment) {
            const feature = Array.isArray(ROUTES.MPAYM) ? ROUTES.MPAYM : [ROUTES.MPAYM];
            newRawRoot = [...feature, ...newRawRoot];
        }
        const dynamicRoute = [];
        for (let i = 0; i < newRawRoot.length; i++) {
            let found = false;
            const subCate = this.formatCate(newRawRoot[i].subCategory);
            const { featureCode } = newRawRoot[i];
            const breakDownRoutes = ROUTES[featureCode];
            if (subCate && breakDownRoutes) {
                dynamicRoute.map((x) => {
                    if (this.formatCate(x.title) === subCate) {
                        found = true;
                        try {
                            return { ...x, children: x.children.push(...breakDownRoutes) };
                        } catch (e) {
                            if (x.children) {
                                return {
                                    ...x,
                                    children: x.children.length
                                        && x.children.push(breakDownRoutes)
                                };
                            }
                            return x;
                        }
                    }
                    return x;
                });
            }

            if (!found && ROUTES[subCate || featureCode]) {
                const rootCate = ROUTES[subCate || featureCode];
                if (subCate) {
                    rootCate.children = breakDownRoutes;
                }

                if (Array.isArray(rootCate) === true) {
                    dynamicRoute.push(...rootCate);
                } else {
                    dynamicRoute.push(rootCate);
                }
            }
        }
        return this.uniqueChildrenRoute(dynamicRoute);
    }

    uniqueChildrenRoute(dynamicRoute) {
        const array = dynamicRoute.map((item) => {
            const { children } = item;
            const tempChildren = [];
            const newChildren = Array.isArray(children) ? children : [children];
            if (children) {
                newChildren?.forEach((child) => {
                    if (!tempChildren.find((data) => data.id === child?.id)) {
                        tempChildren.push(child);
                    }
                });
            }
            return {
                ...item,
                children: tempChildren
            };
        });
        return array;
    }

    formatCate(cate) {
        return cate ? cate.replace(/ /g, "").replace("-", "") : cate;
    }

    getModule() {
        return window.location.pathname.split("/")[1];
    }
}
export default new Routes();
