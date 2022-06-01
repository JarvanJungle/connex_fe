import React from 'react';

import URL_CONFIG from 'services/urlConfig';
import { Link } from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { AvForm, AvField } from 'availity-reactstrap-validation';

import CurrenciesService from 'services/CurrenciesService'

import { ToastContainer, toast } from 'react-toastify';
import {
    Container,
    Button,
    Card,
    CardBody,
    CardHeader,
    Media,
    Col,
    Toggle,
    FormGroup,
    Label,
    Input
} from 'components';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './CreateUOM.scss';

import { StickyFooter } from 'components/StickyFooter/StickyFooter';

const SessionByDevice = (props) => (
    <div className={classes['session']}>
        <div className={classes['session__title']}>
            {props.title}
        </div>
        <div className={classes['session__values']}>
            <div className={`${classes['session__percentage']} text-${props.color}`}>
                {props.valuePercent}%
            </div>
            <div className={`${classes['session__value']} text-${props.color}`}>
                {props.value}
            </div>
        </div>
    </div>
);
SessionByDevice.propTypes = {
    title: PropTypes.node,
    color: PropTypes.string,
    valuePercent: PropTypes.string,
    value: PropTypes.string
}

class UOMCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companyUuid: '',
            uomCode: '',
            uomName: '',
            description: '',
            isActive: false,
            action: '',
        };

        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.selectDefaultCurrency = this.selectDefaultCurrency.bind(this);
        this.changeExchangeRateHandler = this.changeExchangeRateHandler.bind(this);

    }

    showToast() {
        toast.error(this.getContentError())
    }

    getContentError() {
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
                        {this.state.errorMessage}
                    </p>
                    <div className="d-flex mt-2">
                        <Button color="danger" onClick={() => { closeToast }}>
                            OK
                        </Button>
                    </div>
                </Media>
            </Media>
        );
        return contentError;
    }

    componentDidMount() {
        var companyDetails = JSON.parse(localStorage.getItem('companyRole'))
        this.setState({ companyUuid: companyDetails.companyUuid })
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.setState({ errorMessage: 'Validation error, please check your input' })
        this.showToast()
    }

    selectDefaultCurrency = (event) => {
        this.setState({defaultCurrency: !this.state.defaultCurrency});
    }


    handleValidSubmit = async (e) => {
        this.setState({ ifSubmit: true })
        if (!this.state.documentTitleErrors) {
            let createRequest = {
                companyUuid : this.state.companyUuid,
                uomCode : this.state.uomCode,
                uomName : this.state.uomName,
                description : this.state.description,
                isActive: this.state.isActive,
            }
            try {
                const response = await CurrenciesService.addCurrency(createRequest)
                if (response.data.status == "OK"){
                    this.props.history.push(URL_CONFIG.LIST_CURRENCIES)
                    this.setState({ successMessage: 'Currency Creation Successful' })
                    this.showSuccessToast()
                }
                else{
                    throw new Error(response.data.message)
                }
            }
            catch (error) {
                console.log('message', error.message)
                const errorMessage = error.message || 'Error creating entity'
                this.setState({ errorMessage })
                this.showToast()
            }
        } else {
            this.setState({ errorMessage: 'Validation error, please check your input' })
            this.showToast()
        }
    }

    showSuccessToast() {
        toast.success(this.getContentInfo())
    }

    getContentInfo() {
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
                        {this.state.successMessage}
                    </p>
                    <div className="d-flex mt-2">
                        <Button color="success" onClick={() => { closeToast }} >
                            I Understand
                        </Button>
                        <Button color="link" onClick={() => { closeToast }} className="ml-2 text-success">
                            Cancel
                        </Button>
                    </div>
                </Media>
            </Media>
        );
        return contentInfo
    }

    selectCurrencyCode = (event) => {
        this.setState({ currencyCode: event.target.value });
        const foundValue = this.state.currencyCodeList.filter(obj => obj.code === event.target.value);
        this.setState({ currencyName: foundValue[0].name })
    }

    changeExchangeRateHandler = (event) =>{
        this.setState({exchangeRate : event.target.value})
    }

    render() {
        const { t, i18n } = this.props;
        const { country, selectedGSTOption, phone, documentList } = this.state;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit}>
                    <Container fluid={false} className={classes['custom-container']}>
                        <HeaderMain
                            title={t('CreateUOM')}
                            className="mb-3"
                        />
                        <Card>
                            <CardHeader tag="h6">
                                {t('NewCurrency')}
                            </CardHeader>
                            <CardBody>
                                <Col lg={4}>
                                    <FormGroup>
                                        <AvField
                                            type="text"
                                            name="uomCode"
                                            label={t('UOMCode')}
                                            placeholder={t('UOMCode')}
                                            value={this.state.currencyCode}
                                            onChange={e => this.selectCurrencyCode(e)}
                                            validate={{
                                                required: { value: true, errorMessage: t('UOMCodeIsRequired') }
                                            }}>
                                        </AvField>
                                        <AvField
                                            type="text"
                                            name="uomName"
                                            label={t('UOMName')}
                                            placeholder={t('UOMName')}
                                            value={this.state.currencyName}
                                            validate={{
                                                required: { value: true, errorMessage: t('UOMNameIsRequired') }
                                            }} />
                                        <AvField
                                            type="text"
                                            name="description"
                                            label={t('Description')}
                                            placeholder={t('Description')}
                                            value={this.state.exchangeRate}
                                            />
                                    </FormGroup>
                                </Col>
                            </CardBody>
                        </Card>
                        {/* END: Module Subscription */}
                    </Container>
                    <StickyFooter>
                        <Link to={URL_CONFIG.LIST_UOM}>
                            <Button color="info" className={`${classes['inputTextButton']} mr-2 px-3`}>
                                {t('Cancel')}
                            </Button>
                        </Link>
                        <Button type="submit" className={`mr-2 px-3`} color="primary">{t('Save&New')}</Button>

                        <Button type="submit" className={`mr-2 px-3`} color="primary">{t('Save')}</Button>
                    </StickyFooter>
                </AvForm>
            </React.Fragment>
        )
    }
}

const CreateUOM = withTranslation()(UOMCreate);
export default CreateUOM;