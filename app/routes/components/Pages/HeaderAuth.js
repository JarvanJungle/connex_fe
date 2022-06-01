import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { LogoThemed } from './../LogoThemed/LogoThemed';

const HeaderAuth = (props) => (
    <div className="mb-4">
        <div className="mb-4 text-center">
            <Link to="/" className="d-inline-block">
                {
                    props.icon ? (
                        <i className={ `fa fa-${ props.icon } fa-3x ${ props.iconClassName }` }></i>
                    ) : (
                        <LogoThemed checkBackground height="70" />
                    )
                }
            </Link>
        </div>
        <h4 className="text-center mb-4">
            { props.title }
        </h4>
        <h6 className="text-center mb-4">
            { props.text }
        </h6>
    </div>
)
HeaderAuth.propTypes = {
    icon: PropTypes.node,
    iconClassName: PropTypes.node,
    title: PropTypes.node,
    text: PropTypes.node,
};
HeaderAuth.defaultProps = {
    title: "Waiting for Data...",
    text: "You're required to setup password before using the system.",
    iconClassName: "text-theme"
};

export { HeaderAuth };
