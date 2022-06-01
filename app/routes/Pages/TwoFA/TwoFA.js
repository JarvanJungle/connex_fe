import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation  } from 'react-i18next';
import './TwoFA.css';
import UserDataService from 'services/UserService'
import { ToastContainer, toast } from 'react-toastify';
import ButtonSpinner from 'components/ButtonSpinner'

import {
    Container,
    Row,
    Card,
    CardBody,
    Col,
    Button,
    UncontrolledModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Media
} from 'components';

import { HeaderMain } from "routes/components/HeaderMain";

const TwoFA = () => {

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

    const [QRCode, setQRCode] = useState("");
    const [secret, setSecret] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = (e) => {
        setIsLoading(true)
        UserDataService.signupTwoFA().then(response => {
            if (response.data.status === "OK"){
                setQRCode(response.data.data.base64)
                setSecret(response.data.data.secretKey)
            }else{
                message = response.data.message
                __showToast('error')
            }
            setIsLoading(false)
        }).catch((error) => {
            message = error.response.data.message
            __showToast('error')
            setIsLoading(false)
        })
    }

    const handleDisable = () => {
        UserDataService.resetOwnTwoFA().then(response => {
            if (response.data.status === "OK"){
                message = '2FA Disabled'
                __showToast('success')
            }else{
                message = response.data.message
                __showToast('error')
            }
        }).catch((error) => {
            message = error.response.data.message
            __showToast('error')
        })
    }

    const buttonStyle = {
        width: "180px"
    }

    return (
    <>
    <Container>        
        <Row className="mb-3">
            <Col lg={ 7 }>
                <HeaderMain 
                    title={t("Security and Login")}
                    className="mb-3 mb-lg-3"
                />
                <h2>{t("Two-Factor Authentication")}</h2>
            </Col>
            <Col lg={ 5 }>
                <div className="py-3">
                    <img className="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yu/r/HJ7jsZAKTxo.png" height="75" width="75" alt=""></img>
                </div>
            </Col>
        </Row>
        <Row className="mb-5">
            <Col lg={ 12 }>
                <div className="_3ks5">
                    <div>
                        <h4>{t("Help Protect Your Account")}</h4>
                        <p><b>{t("Recommended")}</b> · {t("Use an app like Google Authenticator or Duo Mobile to generate verification codes for more protection")}.</p>
                        <ButtonSpinner onclick={handleClick} style={buttonStyle} text={t("Use Authentication App")} isLoading = {isLoading}></ButtonSpinner>                        
                    </div>
                    <br/><br/>

                    {QRCode &&
                    <div>
                        <Card className="mb-3">
                            <CardBody>
                                <div style={{textAlign: "center"}}>
                                    <h3>{t("Set up via Third Party Authenticator")}</h3>
                                    <p>{t("Please use your authentication app (such as Duo or Google Authenticator) to scan this QR code")}.</p>
                                </div>
                                <Row>
                                    <Col lg={ 6 }>
                                        <img className="img mx-auto d-block" src={QRCode}></img>
                                        <br/><br/>
                                    </Col>
                                    <Col lg={ 6 }>
                                        <br/><br/>
                                        <p>{t("Or enter this code into your authentication app")}:</p>
                                        <h5>{secret}</h5>
                                    </Col>
                                </Row>
                                
                                <Link to='/twofa/verification'>
                                    <Button color="primary" className="float-right" style={buttonStyle}>{t("Continue")}</Button>
                                </Link>
                            </CardBody>
                        </Card>
                        <br/><br/>
                    </div>}
                    
                    <Button color="warning" id="modal" style={buttonStyle}>{t("Disable Two FA")}</Button>  
                    <UncontrolledModal target="modal" className="modal-outline-warning">
                        <ModalHeader tag="h6">
                            <span className="text-warning">
                                {t("Disable Two FA")}
                            </span>
                        </ModalHeader>
                        <ModalBody>
                            {t("Are you sure you want to disable two FA")}?
                        </ModalBody>
                        <ModalFooter>
                            <UncontrolledModal.Close color="link" className="text-warning">
                                <span>Close</span>
                            </UncontrolledModal.Close>
                            <UncontrolledModal.Close color="warning">
                                <span onClick={handleDisable}>{t("Save")}</span>
                            </UncontrolledModal.Close>
                        </ModalFooter>
                    </UncontrolledModal>
                </div>
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

export default TwoFA;
