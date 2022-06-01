import React from 'react';
import { Link } from 'react-router-dom';

import {
    EmptyLayout
} from 'components';

import { HeaderAuth } from "routes/components/Pages/HeaderAuth";
import { FooterAuth } from "routes/components/Pages/FooterAuth";

const Error404 = () => (
    <EmptyLayout>
        <EmptyLayout.Section center>
            { /* START Header */}
            <HeaderAuth 
                title="Error, Page not found"
            />
            { /* END Header */}
            { /* START Form */}
        
            { /* END Form */}
            { /* START Bottom Links */}
            <div className="d-flex mb-5">
                <Link to="/">
                    Back to Home
                </Link>
            </div>
            { /* END Bottom Links */}
            { /* START Footer */}
            <FooterAuth />
            { /* END Footer */}
        </EmptyLayout.Section>
    </EmptyLayout>
);

export default Error404;
