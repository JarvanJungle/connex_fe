import React from 'react';
import { useHistory } from 'react-router-dom';
import ReactCodeInput from 'react-code-input';
import UserDataService from 'services/UserService'
import './TwoFAVerification.css';
import { useTranslation  } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import ButtonSpinner from 'components/ButtonSpinner'

import {
    Container,
    Row,
    Button,
    Media,
    Col
} from 'components';

import { HeaderMain } from "routes/components/HeaderMain";
import { HeaderDemo } from "routes/components/HeaderDemo";


const TwoFAVerification = () => {

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
                    <Button color="success" onClick={() => { history.push('/dashboard') }} >
                        I Understand
                    </Button>
                    <Button color="link" onClick={() => { history.push('/dashboard') }}  className="ml-2 text-success">
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
    const [isLoading, setIsLoading] = useState(false);

    const [firstPin, setFirstPin] = useState("");
    const [secondPin, setSecondPin] = useState("");

    const handleClick = () => {
        if (firstPin.length === 6 && secondPin.length ===6){
            setIsLoading(true)
            UserDataService.verifyTwoFA({firstPin:firstPin, secondPin:secondPin}).then((response) => {
                if (response.data.status === "OK"){
                    console.log(response)
                    message = 'Two Factor Authentication Sign Up Successful'
                    __showToast('success')
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
            message = 'Please fill both pins'
            __showToast('error')
        }
    }

    return (
    <>
        <Container>
            <Row className="mb-5">
                <Col lg={ 12 }>
                    <HeaderMain 
                        title={t("Authentication App")}
                        className="mb-3 mb-lg-3"
                    />
                    <h3>{t("Please enter the 2 consecutive sets of 6 digit pin shown in your authentication app")}.</h3>
                </Col>
            </Row>
            <Row>
                <Col lg={ 12 }>
                    <div className="mx-auto d-block">
                    <table>
                        <tbody>
                            <tr>
                                <td style={{textAlign: "right"}}><h4>{t("First Pin")}: &nbsp; &nbsp; </h4></td>
                                <td><ReactCodeInput type='number' value={firstPin} fields={6} onChange={(e) => setFirstPin(e)}/></td>
                            </tr>
                            <tr>
                                <td style={{textAlign: "right"}}><h4>{t("Second Pin")}: &nbsp; &nbsp; </h4></td>
                                <td><ReactCodeInput type='number' value={secondPin} fields={6} onChange={(e) => setSecondPin(e)}/></td>
                            </tr>
                        </tbody>
                    </table>
                    </div>
                </Col>
            </Row>
            <br/><br/><br/><br/><br/>
            <Row>
                <Col lg={ 10 }>
                    {/* <button type="button" className="btn btn-primary float-right btn-lg" onClick= {handleClick}>{t("Verify")}</button> */}
                    <ButtonSpinner onclick={handleClick} text={t("Verify")} className="btn btn-primary float-right btn-lg" isLoading = {isLoading}></ButtonSpinner>
                </Col>
            </Row> 
        </Container>   
        <ToastContainer 
            position={'top-right'}
            autoClose={50000}
            draggable={false}
            hideProgressBar={true}
        /> 
    </>)
}

export default TwoFAVerification;
