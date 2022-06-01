import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const IconOnly = (props) => {
    const { children, className } = props;
    const wrapClass = classNames(className, 'icon-with-badge');
    return (
        <div className={ wrapClass }>
            { children }
        </div>
    );
};
IconOnly.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
};

export { IconOnly };
