import React, {useState} from 'react';
import { Link, useHistory } from 'react-router-dom';
import UserService from 'services/UserService'

import { ToastContainer, toast } from 'react-toastify';
import {
    Form,
    FormGroup,
    Input,
    Button,
    Media,
    Label,
    EmptyLayout,
    ThemeConsumer
} from 'components';

import { HeaderAuth } from "routes/components/Pages/HeaderAuth";
import { FooterAuth } from "routes/components/Pages/FooterAuth";

let message = 'Opp! Something went wrong.'

const contentError = ({ closeToast }) => (
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

const __showToast = (type) => {
    switch(type) {
        case 'success':
            toast.success(contentInfo)
            break;
        case 'error':
            toast.info(contentError);
            break;    
    }
}

const SetupPassword = (props) => {
    const [newPassword, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const history = useHistory();

    const handleClick = () => {
        const user = UserService.getLocalUser()
        if (!user) {
            console.log('error')
            toast.error(contentError)
        } else {
            if (currentPassword && repeatPassword && newPassword){
                if (newPassword === repeatPassword){
                    const email = user.email
                    UserService.setupPassword({newPassword, currentPassword, email}).then((response) => {
                        if (response.data.status === "OK"){
                            UserService.logout();
                            history.push('/success')
                        }else{
                            console.log("error")
                            message = response.data.message
                            __showToast('error')
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
                }
            }
        }
        
    }
    return (<EmptyLayout>
        <EmptyLayout.Section center width={ 480 }>
            { /* START Header */}
            <HeaderAuth 
                title="Setup Your Password"
            />
            { /* END Header */}
            { /* START Form */}
            <Form className="mb-3">
                <FormGroup>
                    <Label for="currentPassword">
                        Current Password
                    </Label>
                    <Input type="password" name="currentPassword" id="currentPassword" placeholder="Current Password..." className="bg-white" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}/>
                </FormGroup>
                <FormGroup>
                    <Label for="password">
                        New Password
                    </Label>
                    <Input type="password" name="password" id="password" placeholder="Password..." className="bg-white" value={newPassword} onChange={(e) => setPassword(e.target.value)}/>
                </FormGroup>
                <FormGroup>
                    <Label for="repeatPassword">
                        Repeat Password
                    </Label>
                    <Input type="password" name="repeatPassword" id="repeatPassword" placeholder="Repeat password" className="bg-white" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)}/>
                </FormGroup>
                <ThemeConsumer>
                {
                    ({ color }) => (
                        <Button color={ color } block tag={ Link } to="/" onClick={handleClick}>
                            Update Password
                        </Button>
                    )
                }
                </ThemeConsumer>
            </Form>
            { /* END Bottom Links */}
            { /* START Footer */}
            <FooterAuth />
            { /* END Footer */}
        </EmptyLayout.Section>
        <ToastContainer 
                    position={'top-right'}
                    autoClose={50000}
                    draggable={false}
                    hideProgressBar={true}
                />
    </EmptyLayout>)
};

export default SetupPassword;
