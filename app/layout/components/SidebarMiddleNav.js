/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { SidebarMenu } from "../../components";

const SidebarMiddleNav = ({ items, userDetails, permissionReducer }) => {
    const location = useLocation();
    return (
        <SidebarMenu>
            {items ? items.map((item) => (
                <SidebarMenu.Item
                    key={item.id}
                    icon={<i className={item.icon} />}
                    title={item.title}
                    to={item.path.toString()}
                >
                    {item.children && item.children.length !== 0
                        && item.children.map((nestedItem) => (
                            <SidebarMenu.Item
                                key={nestedItem.id}
                                title={nestedItem.title}
                                to={nestedItem.path === location.pathname ? "" : nestedItem.path?.toString()}
                            >
                                {nestedItem.children && nestedItem.children.length !== 0
                                    && nestedItem.children.map((nestedItemLevel2) => (
                                        <SidebarMenu.Item
                                            key={nestedItemLevel2.id}
                                            title={nestedItemLevel2.title}
                                            to={nestedItemLevel2.path.toString()}
                                        />
                                    ))}
                            </SidebarMenu.Item>
                        ))}
                </SidebarMenu.Item>
            )) : <></>}
            {userDetails?.roles?.find((item) => item === "ENTITY_ADMIN") && permissionReducer.featureBasedOn === "ADMIN" ? (
                <SidebarMenu.Item
                    icon={<i className="fa fa-fw fa-home" />}
                    to="/current-company-details"
                    title="Company Profile"
                />
            ) : (<></>)}
            {userDetails?.roles?.find((item) => item === "ENTITY_ADMIN") && permissionReducer.featureBasedOn === "ADMIN" ? (
                <SidebarMenu.Item
                    icon={<i className="fa fa-fw fa-home" />}
                    to="/me/settings"
                    title="User Setting"
                />
            ) : (<></>)}
            <SidebarMenu.Item />
        </SidebarMenu>
    );
};

export default SidebarMiddleNav;
