import React from "react";
import PropTypes from "prop-types";

function Analytics(props) {
    const { title, children } = props;

    return (
        <div>
            <div className="hr-text hr-text-center mt-4 mb-4">
                <span>Your Cash</span>
            </div>
            <div>
                { children }
            </div>
        </div>
    );
}

Analytics.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node
};

Analytics.defaultProps = {
    title: "",
    children: null
};

export default Analytics;
