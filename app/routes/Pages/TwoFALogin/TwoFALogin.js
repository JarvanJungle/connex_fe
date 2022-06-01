import React from 'react';
import { useHistory } from 'react-router-dom';
import ReactCodeInput from 'react-code-input';
import UserDataService from 'services/UserService';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation  } from 'react-i18next';
import ButtonSpinner from 'components/ButtonSpinner'

import {
    Form,
    FormGroup,
    FormText,
    Button,
    Label,
    EmptyLayout,
    Media
} from 'components';

import { HeaderAuth } from "../../components/Pages/HeaderAuth";
import { FooterAuth } from "../../components/Pages/FooterAuth";

const TwoFALogin = () => {

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
                    {message}
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

    const { t, i18n } = useTranslation();
    const history = useHistory();

    const [firstPin, setFirstPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        if (firstPin.length === 6){
            setIsLoading(true)
            UserDataService.loginTwoFA({firstPin:firstPin}).then((response) => {
                if (response.data.status === "OK"){
                    const data = response.data.data || {};
                    localStorage.setItem('token', data.tokenType + " " + data.accessToken);
                    localStorage.setItem("user", JSON.stringify(response.data.data))
                    setFirstPin("")
                    history.push('/me/settings');
                    setIsLoading(false)
                }else{
                    message = "Wrong 2FA Pin"
                    __showToast('error')
                    setIsLoading(false)
                }
            }).catch((error) => {
                message = error.response.data.message
                __showToast('error')
                setIsLoading(false)
            })
        }else{
            message = "Not fully filled"
            __showToast('error')
        }
    }

    return (    
    <>
        <EmptyLayout>
            <EmptyLayout.Section center>
                { /* START Header */}
                <HeaderAuth 
                    title={t("Two Factor Authentication")}
                    text={t("Please enter the 6 digit pin shown in your authentication app")}
                />
                <br/>
                { /* END Header */}
                { /* START Form */}
                <Form className="mb-3">
                    <FormGroup>
                        <Label for="pinNumber">
                            {t("Pin Number")}   :
                        </Label>
                        <ReactCodeInput type='number' value={firstPin} fields={6} id="pinNumber" onChange={(e) => setFirstPin(e)}/>
                        <FormText color="muted">
                            
                        </FormText>
                    </FormGroup>
                    <ButtonSpinner onclick={handleClick} text={t("Sign In")} isLoading = {isLoading} style={{width:386}}></ButtonSpinner>
                </Form>
                <br/><br/><br/>
                <ToastContainer 
                    position={'top-right'}
                    autoClose={50000}
                    draggable={false}
                    hideProgressBar={true}
                />

                <FooterAuth />
                { /* END Footer */}
            </EmptyLayout.Section>
        </EmptyLayout>
    </>)
}

export default TwoFALogin;
