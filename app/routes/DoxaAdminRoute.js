/* eslint-disable react/prop-types */

import React, { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import UserService from "services/UserService";
import { useSelector } from "react-redux";
import RedirectToLogin from "./Pages/RedirectToLogin";
import routes from "./routes";

const DoxaAdminRoute = ({
    component: Component,
    setCrumbs,
    ...rest
}) => {
    const authReducer = useSelector((state) => state.authReducer);
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
        setCrumbs(crumbs);
    });

    return (
        authReducer.userDetails?.companies?.length > 0 ? (
            <Route
                {...rest}
                render={(props) => {
                    if (UserService.isAuthenticated()) {
                        if ((UserService.isMustSetupPassword())) {
                            return <Redirect to={{ pathname: "/setup-password" }} />;
                        }
                        if (!UserService.isSupperAdmin(authReducer?.userDetails?.roles)) {
                            return <Redirect to={{ pathname: "/404" }} />;
                        }
                        return <Component {...props} />;
                    }
                    // return <Redirect to = {{ pathname: '/login'}}/>;
                    return <RedirectToLogin />;
                }}
            />
        ) : <></>
    );
};

export default DoxaAdminRoute;
