/* eslint-disable react/prop-types */

import React, { useEffect } from "react";
import { Route } from "react-router-dom";
import { Cookies } from "react-cookie";
import { WEB_STORAGE_KEY } from "helper/constantsDefined";
import routes from "./routes";
import SetupPassword from "./Pages/SetupPassword";
import RedirectToLogin from "./Pages/RedirectToLogin";

const cookies = new Cookies();
const isAuthenticated = () => cookies.get(process.env.SHARE_COOKIES_NAME);
const isMustSetupPassword = () => localStorage.getItem("mustSetPassword") == "true";
const ProtectedRoute = ({
    component: Component,
    setCrumbs,
    ...rest
}) => {
    const crumbs = routes
        // Get all routes that contain the current one.
        .filter(({ path }) => rest.computedMatch.path.includes(path))
        // Swap out any dynamic routes with their param values.
        // E.g. "/pizza/:pizzaId" will become "/pizza/1"
        .map(({ path, ...others }) => ({
            path: Object.keys(rest.computedMatch.params).length
                ? Object.keys(rest.computedMatch.params).reduce(
                    (path, param) => path.replace(
                        `:${param}`, rest.computedMatch.params[param]
                    ), path
                )
                : path,
            ...others
        }));
    useEffect(() => {
        setCrumbs(crumbs.length > 0 ? [crumbs[0]] : crumbs);
    });

    return (
        <Route
            {...rest}
            render={(props) => {
                if (isAuthenticated()) {
                    if ((isMustSetupPassword())) {
                        // return <Redirect to = {{ pathname: '/setup-password'}}/>;
                        return <SetupPassword />;
                    }
                    return <Component {...props} />;
                }
                // return <Redirect to = {{ pathname: '/login'}}/>;
                return <RedirectToLogin />;
            }}
        />
    );
};

export default ProtectedRoute;
