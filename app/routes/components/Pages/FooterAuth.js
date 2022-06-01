import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FooterText } from '../FooterText';

const FooterAuth = ({ className }) => (
    <div className={ classNames(className, 'small') }>
        <FooterText/>
    </div>
);
FooterAuth.propTypes = {
    className: PropTypes.string
};

export { FooterAuth };
