import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FEATURE_ROUTE_BASED } from "helper/constantsDefined";
import { setToLS } from "helper/utilities";
import { useDispatch } from "react-redux";
import { updateCurrentCategoryMenu } from "actions/permissionActions";
import { scrollHorizontal } from "HOC/ScrollHorizontal";
import { useAuthenticated } from "routes/hooks";
import {
    Navbar,
    Nav,
    NavItem,
    SidebarTrigger,
    ThemeConsumer
} from "../../components";
import NavbarMessages from "./NavbarMessages";
import NavbarTopMenuToggle from "./topMenuButtons/NavbarTopMenuToggle";
import { NavbarUser } from "./NavbarUser";
import classes from "./SidebarWithNavbarNavbar.scss";
import { mappingCategory } from "./mappingCategory";

const SidebarWithNavbarNavbar = ({ crumbs }) => {
    const dispatch = useDispatch();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer } = permissionReducer;
    const [currentRoutes, setCurrentRoutes] = useState();

    useEffect(() => {
        if (permissionReducer && permissionReducer.userPermission) {
            const rootRoute = permissionReducer
                .userPermission[permissionReducer.featureBasedOn]
                ?.routes;
            setCurrentRoutes(rootRoute);
        }
    }, [permissionReducer]);

    function redirectPage(item) {
        dispatch(updateCurrentCategoryMenu(item));
        setToLS(FEATURE_ROUTE_BASED.CURRENT_CATEGORY, item);
    }

    function showTopMenu() {
        if (currentRoutes) {
            let menuNames = Object.keys(currentRoutes);
            if (!isBuyer) {
                menuNames = menuNames.filter((item) => item !== "Requisitions" && item !== "Payments");
            }
            return menuNames.map((item) => (
                <div
                    aria-hidden="true"
                    key={item}
                    to="#"
                    onClick={() => redirectPage(item)}
                    className="sidebar-menu__entry__link doxa-navbar-link pe-auto"
                >
                    {item === permissionReducer.currentCategory ? <b>{item}</b> : item}
                </div>
            ));
        }
        return <></>;
    }

    const NavContainer = React.memo(() => (
        <Nav className={classes["navbar-container"]}>
            <Nav navbar>
                <NavItem>
                    <Link
                        to="/dashboard"
                        className="sidebar-menu__entry__link doxa-navbar-link"
                        onClick={() => redirectPage("Dashboard")}
                    >
                        {permissionReducer.currentCategory === "Dashboard" ? (
                            <b>Dashboard</b>
                        ) : (
                            "Dashboard"
                        )}
                    </Link>
                </NavItem>
            </Nav>
            {showTopMenu()}
        </Nav>
    ));

    const ScrollNavBar = scrollHorizontal(NavContainer);

    const isAuthenticated = useAuthenticated();

    return (
        <ThemeConsumer>
            {({ color }) => (
                <>
                    {/*    Main Navbar    */}
                    <Navbar
                        light
                        fluid
                        className="pb-0 pb-lg-2 border-bottom"
                        expand="lg"
                        themed
                    >
                        <Nav navbar>
                            <NavItem>
                                <SidebarTrigger />
                            </NavItem>
                        </Nav>
                        {isAuthenticated && (
                            <ScrollNavBar />
                        )}
                        <Nav navbar className="ml-auto nav-bar-sub-tool align-items-center">
                            <NavbarTopMenuToggle />
                            {isAuthenticated && (
                                <>
                                    <NavbarMessages className="ml-2" />
                                    <NavbarUser className="ml-2" />
                                </>
                            )}
                        </Nav>
                    </Navbar>
                    {/*    Second Navbar    */}
                    {isAuthenticated && (
                        <NavItem
                            className={`d-none d-md-block ${classes["navbar-breadcrumb"]}`}
                        >
                            <span className="navbar-text">
                                <Link to="/">
                                    <i className="fa fa-home" />
                                </Link>
                            </span>
                            <span className="navbar-text px-2">
                                <i className="fa fa-angle-right" />
                            </span>
                            <span className="navbar-text">
                                <Link to="/">Home</Link>
                            </span>
                            {crumbs.map(({ name, path }, key) => (key + 1 === crumbs.length ? (
                                <React.Fragment key={name}>
                                    {mappingCategory(name).cat && (
                                        <>
                                            <span className="navbar-text px-2">
                                                <i className="fa fa-angle-right" />
                                            </span>
                                            {
                                                mappingCategory(name).pathCat
                                                && (
                                                    <span className="navbar-text">
                                                        <Link to={mappingCategory(name).pathCat}>
                                                            {mappingCategory(name).cat}
                                                        </Link>
                                                    </span>
                                                )
                                            }
                                            {
                                                !mappingCategory(name).pathCat
                                                && (
                                                    <span className="navbar-text">
                                                        {mappingCategory(name).cat}
                                                    </span>
                                                )
                                            }
                                        </>
                                    )}
                                    {mappingCategory(name).subCat && (
                                        <>
                                            <span className="navbar-text px-2">
                                                <i className="fa fa-angle-right" />
                                            </span>
                                            {
                                                mappingCategory(name).pathSubCat
                                                && (
                                                    <span className="navbar-text">
                                                        <Link to={mappingCategory(name).pathSubCat}>
                                                            {mappingCategory(name).subCat}
                                                        </Link>
                                                    </span>
                                                )
                                            }
                                            {
                                                !mappingCategory(name).pathSubCat
                                                && (
                                                    <span className="navbar-text">
                                                        {mappingCategory(name).subCat}
                                                    </span>
                                                )
                                            }
                                        </>
                                    )}
                                    {mappingCategory(name).subSubCat && (
                                        <>
                                            <span className="navbar-text px-2">
                                                <i className="fa fa-angle-right" />
                                            </span>
                                            {
                                                mappingCategory(name).pathSubSubCat
                                                && (
                                                    <span className="navbar-text">
                                                        <Link to={mappingCategory(name).pathSubSubCat}>
                                                            {mappingCategory(name).subSubCat}
                                                        </Link>
                                                    </span>
                                                )
                                            }
                                            {
                                                !mappingCategory(name).pathSubSubCat
                                                && (
                                                    <span className="navbar-text">
                                                        {mappingCategory(name).subSubCat}
                                                    </span>
                                                )
                                            }
                                        </>
                                    )}
                                    <span className="navbar-text px-2">
                                        <i className="fa fa-angle-right" />
                                    </span>
                                    {
                                        mappingCategory(name).title
                                        && (
                                            <span className="navbar-text">
                                                {mappingCategory(name).title}
                                            </span>
                                        )
                                    }
                                    {
                                        !mappingCategory(name).title
                                        && (
                                            <span className="navbar-text">{name}</span>
                                        )
                                    }
                                </React.Fragment>
                            ) : (
                                <React.Fragment key={name}>
                                    <span className="navbar-text px-2">
                                        <i className="fa fa-angle-right" />
                                    </span>
                                    <span className="navbar-text">
                                        <Link to={path}>{name}</Link>
                                    </span>
                                </React.Fragment>
                            )))}
                        </NavItem>
                    )}
                </>
            )}
        </ThemeConsumer>
    );
};

export default SidebarWithNavbarNavbar;
