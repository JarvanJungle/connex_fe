import React, { forwardRef, useImperativeHandle } from "react";
import IconButton from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";
import { Row } from "components";
import DOXA_ADMIN_MANAGE_ROLES_ROUTES from "../routes";

export default forwardRef((params, ref) => {
    const { data } = params;

    useImperativeHandle(ref, () => ({
        getReactContainerStyle() {
            return { width: "100%" };
        }
    }));

    return (
        <Row className="mx-0 justify-content-between">
            <Link
                to={{
                    pathname: DOXA_ADMIN_MANAGE_ROLES_ROUTES.ROLE_DETAILS,
                    search: `?uuid=${data?.uuid}`
                }}
            >
                <IconButton
                    size="small"
                    onClick={() => { }}
                >
                    <i className="fa fa-pencil" />
                </IconButton>
            </Link>
            <Link
                to={{
                    pathname: DOXA_ADMIN_MANAGE_ROLES_ROUTES.CREATE_NEW_ROLE,
                    search: `?uuid=${data?.uuid}`
                }}
            >
                <IconButton
                    size="small"
                    onClick={() => { }}
                >
                    <i className="fa fa-files-o" />
                </IconButton>
            </Link>
            <IconButton
                size="small"
                onClick={() => { }}
                style={{ color: "red" }}
            >
                <i className="fa fa-trash" />
            </IconButton>
        </Row>
    );
});
