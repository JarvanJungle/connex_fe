import React from 'react';
import classes from './stickyfooter.scss';


const StickyFooter = (props) => {
    const {children} = props;
    return (<React.Fragment>
        <footer className={`${classes['custom-footer']}`}>
            <div>
                {children}
            </div>
        </footer>
    </React.Fragment>);
}

export { StickyFooter };
