import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router";
import classNames from "classnames";

const LayoutContent = (props) => {
    const location = useLocation();
    return (
        <div className={classNames("layout__content", { "p-0": location.pathname === "/login" })}>
            {props.children}
        </div>
    );
};

LayoutContent.propTypes = {
    children: PropTypes.node
};
LayoutContent.layoutPartName = "content";

export {
    LayoutContent
};
