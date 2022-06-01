import React from 'react';
import { toast } from 'react-toastify';

import {Media, Button} from '../components'

const contentError = ({ closeToast }, message) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-close"></i>
        </Media>
        <Media body>
            <Media heading tag="h6">
                Error!
            </Media>
            <p>
                {message}
            </p>
            <div className="d-flex mt-2">
                <Button color="danger" onClick={() => { closeToast }}>
                    OK
                </Button>
            </div>
        </Media>
    </Media>
);
// eslint-disable-next-line react/prop-types
const contentInfo = ({ closeToast }) => (
    <Media>
        <Media middle left className="mr-3">
            <i className="fa fa-fw fa-2x fa-check"></i>
        </Media>
        <Media body>
            <Media heading tag="h6">
                Success!
            </Media>
            <p>
                You successfully login to the system.
            </p>
            <div className="d-flex mt-2">
                <Button color="success" onClick={() => { closeToast }} >
                    I Understand
                </Button>
                <Button color="link" onClick={() => { closeToast }}  className="ml-2 text-success">
                    Cancel
                </Button>
            </div>
        </Media>
    </Media>
);

const showError = (message) => {
    toast.error(contentError({closeToast}, message))
}