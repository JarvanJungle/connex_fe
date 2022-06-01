import React from 'react';
import URL_CONFIG from "services/urlConfig"
import Currencies from '/public/assets/Currencies.jsx'
import { Link} from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import CurrenciesService from 'services/CurrenciesService'
import {
    Container,
    Row,
    Button,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    Media,
    Col,
    FormGroup,
} from 'components';
import { HeaderMain } from "routes/components/HeaderMain";
import classes from './CreateCurrency.scss';
import { StickyFooter } from 'components/StickyFooter/StickyFooter';
import useToast from "routes/hooks/useToast";
import {debounce} from "helper/utilities";


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

class CreateCurrency1 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            companyUuid: '',
            currencyCode: '',
            currencyName: '',
            exchangeRate: '',
            defaultCurrency: false,
            currencyCodeList: Currencies.currencies,
            exchangeRateError: false,
            currencyError: false,
            currencyNameError: false,
            hasDefault: false
        };
        this.toast = useToast();

        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.selectDefaultCurrency = this.selectDefaultCurrency.bind(this);
        this.changeExchangeRateHandler = this.changeExchangeRateHandler.bind(this);
        this.retrieveCurrencies = this.retrieveCurrencies.bind(this);

    }

    componentDidMount() {
        var companyDetails = JSON.parse(localStorage.getItem('companyRole'))
        this.setState({ companyUuid: companyDetails.companyUuid })
        this.retrieveCurrencies(companyDetails.companyUuid);
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.toast("error", 'Validation error, please check your input')
    }

    selectDefaultCurrency = (event) => {
        this.setState({
            exchangeRate: this.state.exchangeRate ? this.state.exchangeRate.toFixed(6) : (1).toFixed(6),
            defaultCurrency: !this.state.defaultCurrency
        });
    }


    handleValidSubmit = async (e) => {
        this.setState({ ifSubmit: true })
        if (!this.state.documentTitleErrors) {
            let createRequest = {
                companyUuid : this.state.companyUuid,
                currencyCode : this.state.currencyCode,
                currencyName : this.state.currencyName,
                exchangeRate : this.state.exchangeRate,
                defaultCurrency: this.state.defaultCurrency
            }
            try {
                const response = await CurrenciesService.addCurrency(createRequest)
                if (response.data.status == "OK"){
                    this.props.history.push(URL_CONFIG.LIST_CURRENCIES)
                    this.toast("success", 'Currency Creation Successful')
                }
                else{
                    throw new Error(response.data.message)
                }
            }
            catch (error) {
                console.log('message', error.message)
                const errorMessage = error.message || 'Error creating entity'
                this.toast("error", errorMessage);
            }
        } else {
            this.toast("error", 'Validation error, please check your input');
        }
    }
    retrieveCurrencies = async (companyUuid) => {
        try {
            const response = await CurrenciesService.getCurrencies(companyUuid)
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                console.log(responseData);
                var currencyList = responseData;
                currencyList.forEach((row) =>{
                    if(row.defaultCurrency){
                        this.setState({hasDefault: true})
                    }
                })
            }
            else {
                throw new Error(response.data.message)
            }
        } catch (error) {
            console.error('message', error.response?.data?.message)
            const errorMessage = error.response?.data?.message || 'System error!'
            this.toast("error", errorMessage)
        }
    }

    selectCurrencyCode = (event) => {
        this.setState({ currencyCode: event.target.value });
        const foundValue = this.state.currencyCodeList.filter(obj => obj.code === event.target.value);
        this.setState({ currencyName: foundValue[0].name })
    }

    changeExchangeRateHandler = (event) => {
        if (event.target.value) this.setState({exchangeRate: Number(event.target.value)})
    }

    render() {
        const { t, i18n } = this.props;
        const { country, selectedGSTOption, phone, documentList } = this.state;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={debounce(this.handleValidSubmit)} onInvalidSubmit={debounce(this.handleInvalidSubmit)}>
                    <Container fluid className={classes['custom-container']}>
                        <HeaderMain
                            title={t('Create Currency')}
                            className="mb-3"
                        />
                        <Card>
                            <CardHeader tag="h6">
                                {t('Currency Details')}
                            </CardHeader>

                            <CardBody>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="currencyCode"
                                                label={t('Currency')}
                                                value={this.state.currencyCode}
                                                onChange={e => this.selectCurrencyCode(e)}
                                                validate={{
                                                    required: { value: true, errorMessage: t('PleaseSelectCurrency') }
                                                }}>
                                                <option key="" value="">{t('PleaseSelectCurrency')}</option>
                                                {this.state.currencyCodeList.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup>
                                            <AvField
                                                type="text"
                                                name="currencyName"
                                                label={t('CurrencyName')}
                                                placeholder={t('CurrencyName')}
                                                value={this.state.currencyName}
                                                disabled />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>

                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="number"
                                                name="exchangeRate"
                                                label={t('ExchangeRate')}
                                                placeholder={t('ExchangeRate')}
                                                onChange={this.changeExchangeRateHandler}
                                                value={this.state.exchangeRate}
                                                validate={{
                                                    min: {value: 0},
                                                    number: { value: true, errorMessage: t('ExchangeRateValidation') },
                                                    required: { value: true, errorMessage: t('ExchangeRateValidation') },
                                                }}
                                                onBlur={() => this.setState({exchangeRate: this.state.exchangeRate.toFixed(6)})}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                    <FormGroup>
                                            <CustomInput
                                                type="checkbox"
                                                name="defaultCurrency"
                                                id="checkboxesStackedCustom1"
                                                label="Set Default Currency"
                                                onChange={e => this.selectDefaultCurrency(e)}
                                                className={`${classes['checkBox']}`}
                                                // disabled={this.state.hasDefault}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        {/* END: Module Subscription */}
                    </Container>
                    <StickyFooter>
                        <Row className="justify-content-between px-3 mx-0">
                            <Link to={URL_CONFIG.LIST_CURRENCIES}>
                                <Button color="secondary" className={`${classes['inputTextButton']} mr-2 px-3`}>
                                    {t('Back')}
                                </Button>
                            </Link>
                            <Button type="submit" className={`mr-2 px-3`} color="primary">{t('Create')}</Button>
                        </Row>
                    </StickyFooter>
                </AvForm>
            </React.Fragment>
        )
    }
}

const CreateCurrency = withTranslation()(CreateCurrency1);
export default CreateCurrency;
