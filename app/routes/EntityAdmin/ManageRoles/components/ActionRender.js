import React, { forwardRef, useImperativeHandle } from "react";
import IconButton from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";
import { Row } from "components";
import MANAGE_ROLES_ROUTE from "../routes";

export default forwardRef((params, ref) => {
    const { data } = params;

    useImperativeHandle(ref, () => ({
        getReactContainerStyle() {
            return { width: "100%" };
        }
    }));

    return (
        <>
            {data?.createdBy === "Doxa Admin" && (
                <Row className="mx-0 justify-content-center">
                    <Link
                        to={{
                            pathname: MANAGE_ROLES_ROUTE.CREATE_NEW_ROLE,
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
                </Row>
            )}
            {data?.createdBy !== "Doxa Admin" && (
                <Row className="mx-0 justify-content-between">
                    <Link
                        to={{
                            pathname: MANAGE_ROLES_ROUTE.ROLE_DETAILS,
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
                            pathname: MANAGE_ROLES_ROUTE.CREATE_NEW_ROLE,
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
            )}
        </>
    );
});
