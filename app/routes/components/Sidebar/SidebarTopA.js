import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
    Sidebar,
    UncontrolledButtonDropdown,
    Avatar,
    AvatarAddOn,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "components";
import UserService from "services/UserService";
import { useAuthenticated } from "routes/hooks";
import _ from "lodash";

const avatarImg = "/static/nobody.jpeg";

const SidebarTopA = () => {
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const permissionReducer = useSelector((state) => state.permissionReducer);

    const [avatar, setAvatar] = useState();
    const [microFELinks, setMicroFeLinks] = useState([]);

    useEffect(() => {
        console.log("SidebarTopA ~ userDetails", userDetails);
        setAvatar(userDetails?.avatarUrl);
    }, [userDetails]);

    useEffect(() => {
        UserService.getMicroFE().then((res) => {
            setMicroFeLinks(res.data.data);
        });
    }, []);

    const isAuthenticated = useAuthenticated();

    return (
        <>
            { /* START: Sidebar Default */ }
            <Sidebar.HideSlim>
                <Sidebar.Section className="pt-100">
                    <div className="d-flex justify-content-between align-items-start">
                        {isAuthenticated && (
                            <UncontrolledButtonDropdown className="button-group-change-module">
                                <DropdownToggle color="link" className="btn-profile sidebar__link shadow-none" style={{ color: "white" }}>
                                    <i className="fa fa-bars" />
                                </DropdownToggle>
                                <DropdownMenu persist>
                                    {
                                        microFELinks.map((link, index) => (
                                            <React.Fragment key={link.moduleCode}>
                                                <DropdownItem onClick={
                                                    () => {
                                                        window.location.href = link.host;
                                                    }
                                                }
                                                >
                                                    <i className="fa fa-fw fa-link mr-2" />
                                                    {link.moduleName}
                                                </DropdownItem>
                                                {index !== microFELinks.length - 1 && <DropdownItem divider />}
                                            </React.Fragment>
                                        ))
                                    }
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        )}
                        <Link to="/" className="d-block">
                            <Sidebar.HideSlim>
                                <Avatar.Image
                                    className="pt-3"
                                    size="lg"
                                    src={avatar || avatarImg}
                                    addOns={[
                                        <AvatarAddOn.Icon
                                            className="fa fa-circle"
                                            color="white"
                                            key="avatar-icon-bg"
                                        />,
                                        <AvatarAddOn.Icon
                                            className="fa fa-circle"
                                            color="success"
                                            key="avatar-icon-fg"
                                        />
                                    ]}
                                />
                            </Sidebar.HideSlim>
                        </Link>
                        {isAuthenticated && (
                            <UncontrolledButtonDropdown>
                                <DropdownToggle color="link" className="btn-profile sidebar__link shadow-none" style={{ color: "white" }}>
                                    {permissionReducer.featureBasedOn}
                                    {" "}
                                    PROFILE
                                    <i className="fa fa-angle-down ml-2" />
                                </DropdownToggle>
                                <DropdownMenu persist>
                                    <DropdownItem
                                        onClick={() => {
                                            window.location.href = _.find(microFELinks, { moduleCode: "ADMIN" }).host;
                                        }}
                                    >
                                        ADMIN
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem tag={Link} to="/me/settings">
                                        Settings
                                    </DropdownItem>
                                    <DropdownItem divider />
                                    <DropdownItem tag={Link} to="/login" onClick={UserService.logout}>
                                        <i className="fa fa-fw fa-sign-out mr-2" />
                                        Sign Out
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        )}
                    </div>
                    <div style={{ color: "white", fontSize: "1.1em", fontWeight: 600 }} className="w-100">
                        { authReducer.userDetails?.name }
                    </div>
                    <div style={{ color: "white", fontSize: "1em" }} className="w-100">
                        { authReducer.userDetails?.designation}
                    </div>
                </Sidebar.Section>
            </Sidebar.HideSlim>
            { /* END: Sidebar Default */ }

            { /* START: Sidebar Slim */ }
            <Sidebar.ShowSlim>
                <Sidebar.Section>
                    <Avatar.Image
                        size="sm"
                        src={avatarImg}
                        addOns={[
                            <AvatarAddOn.Icon
                                className="fa fa-circle"
                                color="white"
                                key="avatar-icon-bg"
                            />,
                            <AvatarAddOn.Icon
                                className="fa fa-circle"
                                color="success"
                                key="avatar-icon-fg"
                            />
                        ]}
                    />
                </Sidebar.Section>
            </Sidebar.ShowSlim>
            { /* END: Sidebar Slim */ }
        </>
    );
};

export default SidebarTopA;
