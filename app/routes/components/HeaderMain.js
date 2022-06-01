import React from "react";
import PropTypes from "prop-types";

const HeaderMain = (props) => {
    const { title, className, loading } = props;
    return (
        <div className={`d-flex ${className}`}>
            {!loading && (
                <h1 className="display-5 mr-3 mb-0 align-self-start">
                    <span>{title}</span>
                </h1>
            )}
            {loading && (<div className="phl-col-2 phl-header-main" />)}
        </div>
    );
};

HeaderMain.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string
};

HeaderMain.defaultProps = {
    title: "Waiting for Data...",
    className: "my-4"
};

export { HeaderMain };
