import React, { useState, useEffect, useRef } from "react";
import { hot } from "react-hot-loader";
import { BrowserRouter as Router } from "react-router-dom";
import AppLayout from "layout/default";
import { RoutedContent } from "routes";
import { ThemeProvider } from "styled-components";
import WebFont from "webfontloader";
import GlobalStyles from "theme/GlobalStyles";
import { useTheme } from "theme/useTheme";
import { useDispatch } from "react-redux";
import { getUserDetails } from "actions/authActions";
import { loadProgressBar } from "axios-progress-bar";
import { useCookies, Cookies } from "react-cookie";
import { notification } from "helper/utilities";
import { useSelector } from "react-redux";
import UserService from "services/UserService";

const basePath = process.env.BASE_PATH || "/";

function AppClient() {
    const dispatch = useDispatch();
    const [crumbs, setCrumbs] = useState([]);
    const { theme, themeLoaded, getFonts } = useTheme();
    const [selectedTheme, setSelectedTheme] = useState(theme);
    const [cookies] = useCookies([process.env.SHARE_COOKIES_NAME]);
    const prevTokenRef = useRef();
    const authReducer = useSelector((state) => state.authReducer);
    let showError = false;

    const updateCrumbs = (props) => {
        if (JSON.stringify(props) !== JSON.stringify(crumbs)) {
            setTimeout(() => {
                setCrumbs(props);
            });
        }
    };

    useEffect(() => {
        loadProgressBar();
        const token = cookies[process.env.SHARE_COOKIES_NAME];
        if (token && token !== "" && !window.location.pathname.includes("sso_redirect")) {
            dispatch(getUserDetails());
        }
        function listenCookieChange(interval = 1000) {
            setInterval(() => {
                const localCookie = new Cookies();
                if (!prevTokenRef.current && localCookie.get(process.env.SHARE_COOKIES_NAME)) {
                    prevTokenRef.current = localCookie.get(process.env.SHARE_COOKIES_NAME);
                } else if (prevTokenRef.current && !localCookie.get(process.env.SHARE_COOKIES_NAME)
                    && !window.location.pathname.includes("sso_redirect")
                    && !window.location.pathname.includes("login")) {
                    if (!showError && !authReducer.logout) {
                        notification(
                            "Notification",
                            "Your session has ended, Please login again.",
                            "error"
                        ).then(() => {
                            UserService.logout();
                        });
                        showError = true;
                    }
                } else if (prevTokenRef.current && localCookie.get(process.env.SHARE_COOKIES_NAME)
                    && prevTokenRef.current !== localCookie.get(process.env.SHARE_COOKIES_NAME)
                    && !window.location.pathname.includes("sso_redirect")
                    && !window.location.pathname.includes("login")) {
                    if (!showError && !authReducer.logout) {
                        notification(
                            "Notification",
                            "Login data has been changed, please reload the page",
                            "error"
                        ).then(() => {
                            window.location.reload();
                        });
                        showError = true;
                    }
                }
            }, interval);
        }
        listenCookieChange();
    }, []);

    useEffect(() => {
        setSelectedTheme(theme);
    }, [themeLoaded]);

    useEffect(() => {
        WebFont.load({
            google: {
                families: getFonts()
            }
        });
    });

    return (
        <>
            {themeLoaded && (
                <ThemeProvider theme={selectedTheme}>
                    <GlobalStyles />
                    <Router basename={basePath}>
                        <AppLayout crumbs={crumbs}>
                            <RoutedContent setCrumbs={updateCrumbs} />
                        </AppLayout>
                    </Router>
                </ThemeProvider>
            )}
        </>
    );
}

export default hot(module)(AppClient);
