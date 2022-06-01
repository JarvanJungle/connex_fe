/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
    Route,
    Switch,
    Redirect
} from "react-router";

// ----------- Pages Imports ---------------

import ProtectedRoute from "./ProtectedRoute";

// ----------- Layout Imports ---------------
import DefaultSidebar from "../layout/components/DefaultSidebar";
import SidebarWithNavbarNavbar from "../layout/components/SidebarWithNavbarNavbar";
import DoxaAdminRoute from "./DoxaAdminRoute";

import routes from "./routes";
import SSORedirectPage from "./Pages/Login/SSORedirect";

// ------ Route Definitions --------
// eslint-disable-next-line no-unused-vars
export const RoutedContent = ({ setCrumbs }) => (
    <Switch>
        <Redirect from="/" to="/dashboard" exact />
        {routes.map(({
            path, name, isProtected, Component, render, doxaAdmin
        }, key) => {
            if (doxaAdmin) {
                return (
                    <DoxaAdminRoute
                        path={path}
                        exact
                        component={Component}
                        key={key}
                        setCrumbs={setCrumbs}
                    />
                );
            }
            if (isProtected === true) {
                return (
                    <ProtectedRoute
                        exact
                        path={path}
                        exact
                        component={Component}
                        key={key}
                        setCrumbs={setCrumbs}
                    />
                );
            }
            return (
                <Route
                    exact
                    path={path}
                    key={key}
                    render={(props) => {
                        const crumbs = routes
                        // Get all routes that contain the current one.
                            .filter(({ path }) => props.match.path.includes(path))
                        // Swap out any dynamic routes with their param values.
                        // E.g. "/pizza/:pizzaId" will become "/pizza/1"
                            .map(({ path, ...rest }) => ({
                                path: Object.keys(props.match.params).length
                                    ? Object.keys(props.match.params).reduce(
                                        (path, param) => path.replace(
                                            `:${param}`, props.match.params[param]
                                        ), path
                                    )
                                    : path,
                                ...rest
                            }));
                        setCrumbs(crumbs);
                        return (
                            <Component {...props} />
                        );
                    }}
                />
            );
        })}
        <Route path="/sso_redirect" render={(props) => <SSORedirectPage {...props} />} />
    </Switch>
);

// ------ Custom Layout Parts --------
export const RoutedNavbars = (props) => {
    const { crumbs } = props;

    return (
        <Switch>
            { /* Other Navbars: */}
            {/* <Route
            component={ SidebarANavbar }
            path="/layouts/sidebar-a"
        /> */}

            <Route
                render={(props) => <SidebarWithNavbarNavbar crumbs={crumbs} />}
            // component = {SidebarWithNavbarNavbar}
            />
            {/* <Route
            component={ DefaultNavbar }
        /> */}
        </Switch>
    );
};

export const RoutedSidebars = () => (
    <Switch>
        { /* Other Sidebars: */}

        { /* Default Sidebar: */}
        <Route
            component={DefaultSidebar}
        />
    </Switch>
);
