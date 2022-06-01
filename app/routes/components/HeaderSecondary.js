import React from "react";
import PropTypes from "prop-types";

const HeaderSecondary = (props) => {
    const { className, title, loading } = props;
    return (
        <>
            <div className={` d-flex ${className}`}>
                {!loading && (
                    <h3 className="display-5 mr-3 mb-0 align-self-start">
                        {title}
                    </h3>
                )}
                {loading && (<div className="phl-col-2 phl-header-secondary" />)}
            </div>
        </>
    );
};
HeaderSecondary.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string
};
HeaderSecondary.defaultProps = {
    title: "Waiting for Data...",
    className: "my-4"
};

export { HeaderSecondary };
