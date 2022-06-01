import React from "react";
import { Button as RSButton } from "reactstrap";
import { debounce } from "lodash";
import PropTypes from "prop-types";

const Button = ({ onClick, wait, ...props }) => {
    const onClickDebounced = typeof onClick === "function" ? debounce(onClick, wait) : onClick;
    return <RSButton {...props} onClick={onClickDebounced} />;
};

Button.propTypes = {
    wait: PropTypes.number
};
Button.defaultProps = {
    wait: 500
};
export default Button;
