import React from "react";
import { Link } from "react-router-dom";
import MANAGE_ROLES_ROUTE from "../routes";

export default function RoleRender(params) {
    const { data } = params;
    return (
        <>
            {data?.createdBy === "Doxa Admin" && (
                <Link
                    style={{
                        color: "rgb(68, 114, 196)",
                        border: "unset",
                        cursor: "pointer",
                        background: "unset",
                        textDecoration: "underline",
                        padding: "0px"
                    }}
                    to={{
                        pathname: MANAGE_ROLES_ROUTE.ROLE_DETAILS,
                        search: `?uuid=${data?.uuid}`
                    }}
                >
                    {data?.name}
                </Link>
            )}
            {data?.createdBy !== "Doxa Admin" && (
                <div>{data?.name}</div>
            )}
        </>
    );
}
