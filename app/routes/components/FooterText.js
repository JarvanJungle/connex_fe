import React from 'react';
import PropTypes from 'prop-types';

const logos = {
    'poweredLogo': require('./../../images/logos/powered-logo.png'),
}

const FooterText = (props) => (
	<React.Fragment>
		<div>
			Powered by
		</div>
		<img src={logos.poweredLogo} className="w-100 pt-3 pb-3" />
		<div>
			Copyright © { props.year }  DOXA.
		</div>
		<div>
			All Rights Reserved.
		</div>
		<div>
			<a
				href="https://www.doxa-holdings.com"
				target="_blank"
				rel="noopener noreferrer"
				className="sidebar__link text-dark"
			>
				www.doxa-holdings.com
			</a>
		</div>
		<div className="text-dark">
			v.02.01.01
		</div>
		{/* Copyright © { props.year }  DOXA. All Rights Reserved.
		<a
			href="https://www.doxa-holdings.com"
			target="_blank"
			rel="noopener noreferrer"
			className="sidebar__link text-primary"
		>
			www.doxa-holdings.com
		</a> */}
	</React.Fragment>
)
FooterText.propTypes = {
    year: PropTypes.node,
	name: PropTypes.node,
	desc: PropTypes.node,
};
FooterText.defaultProps = {
    year: new Date().getFullYear(),
    name: "Doxa Connex 2.0"
};

export { FooterText };
