import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import CardHeader from "../CardHeader";
import { Consumer } from "./context";
import classes from "./AccordionHeader.scss";

function AccordionHeader(props) {
    return (
        <Consumer>
           <Toggle onToggle={() => {}}/>
        </Consumer>
    );
}

const Toggle = ({ onToggle }) => (
    <CardHeader
        className={
            classNames(
                props.className,
                classes.header
            )
        }
        onClick={onToggle}
    >
        { props.children }
    </CardHeader>
)

AccordionHeader.propTypes = {
    children: PropTypes.node,
    // onClick: PropTypes.func,
    className: PropTypes.string
};

AccordionHeader.defaultProps = {
    children: null,
    // onClick: () => {},
    className: ""
};

export default AccordionHeader;
