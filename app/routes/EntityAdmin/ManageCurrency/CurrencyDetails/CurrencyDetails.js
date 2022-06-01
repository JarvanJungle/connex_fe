import React from 'react';

import URL_CONFIG from 'services/urlConfig';

// the hoc
import { withTranslation } from 'react-i18next';

import { AvForm, AvField } from 'availity-reactstrap-validation';

import Currencies from '/public/assets/Currencies.jsx'

import {
    Container,
    Row,
    Button,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    FormGroup,
    Col
} from 'components';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './CurrencyDetails.scss';

import { StickyFooter } from 'components/StickyFooter/StickyFooter';
import CurrenciesService from 'services/CurrenciesService.js';
import useToast from "routes/hooks/useToast";
import PrivilegesService from 'services/PrivilegesService';
import { FEATURE } from 'helper/constantsDefined';
import {debounce} from "helper/utilities";

const LAYOUT = {
    'metric-v-target-users': { h: 6, md: 4 },
    'metric-v-target-sessions': { h: 6, md: 4 },
    'metric-v-target-pageviews': { h: 6, md: 4 },
    'analytics-audience-metrics': { h: 9, minH: 7 },
    'traffic-channels': { md: 6, h: 6 },
    'sessions': { md: 6, h: 6, maxH: 9, minW: 3 },
    'spend': { md: 6, h: 7 },
    'website-performance': { md: 6, h: 11 },
    'organic-traffic': { md: 6, h: 10 }
}

class CurrencyDetails1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previousDefaultStatus: false,
            companyUuid: '',
            currencyCode: '',
            currencyName: '',
            exchangeRate: '',
            defaultCurrency: false,
            active: false,
            hasDefault: false,
            currencyCodeList: Currencies.currencies,
            isEdit: false,
            handleRole: {
                load: false,
                read: false,
                write: false,
                approve: false
            },
        };
        this.toast = useToast();
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.retrieveCurrencies = this.retrieveCurrencies.bind(this);
    }

    componentDidMount() {
        this.getRole()
        var companyDetails = JSON.parse(localStorage.getItem('companyRole'))
        this.setState({ companyUuid: companyDetails.companyUuid })
        this.retrieveCurrencyDetails()
        this.retrieveCurrencies(companyDetails.companyUuid);
    }

    selectDefaultCurrency = (event) => {
        this.setState({ defaultCurrency: !this.state.defaultCurrency });
    }

    getRole = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userUuid = user.uuid;
            const companyRole = JSON.parse(localStorage.getItem("companyRole"));
            const companyUuid = companyRole.companyUuid;
            const response = await PrivilegesService.getPermissionsOfAnUser(
                companyUuid, userUuid
            );
            const { data } = response.data;
            const filteredPermissions = data
                .filter((f) => f.featureCode === FEATURE.CURRENCY)
                .map((f) => f.actions);
            const handleRole = {
                read: filteredPermissions.some((p) => p?.read),
                write: filteredPermissions.some((p) => p?.write),
                approve: filteredPermissions.some((p) => p?.approve)
            };
            this.setState({ handleRole })
        } catch (err) {
            console.log(err);
        }
    }

    selectActive = (event) => {
        this.setState({ active: !this.state.active });
    }

    changeExchangeRateHandler = (event) => {
        this.setState({ exchangeRate: Number(event.target.value) || this.state.exchangeRate })
    }

    retrieveCurrencyDetails = async () => {
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('uuid')
        var companyDetails = JSON.parse(localStorage.getItem('companyRole'))

        try {
            const response = await CurrenciesService.getCurrencyDetails(companyDetails.companyUuid, token)
            const responseData = response.data.data
            if (response.data.status == "OK") {
                this.setState({
                    previousDefaultStatus: responseData.defaultCurrency,
                    currencyCode: responseData.currencyCode,
                    currencyName: responseData.currencyName,
                    exchangeRate: responseData.exchangeRate.toFixed(6),
                    defaultCurrency: responseData.defaultCurrency,
                    active: responseData.active
                })
            }
            else {
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            const errorMessage = error.response?.data?.message || 'Error loading currency'
            this.toast("error", errorMessage)
        }
    }

    state = {
        layouts: _.clone(LAYOUT)
    }

    componentDidUpdate(prevProps, prevState) {

    }

    onModelUpdated() {

    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.toast("error", 'Validation error, please check your input')
    }

    handleValidSubmit = async (e) => {
        try {
            let updateRequest = {
                companyUuid: this.state.companyUuid,
                currencyCode: this.state.currencyCode,
                currencyName: this.state.currencyName,
                defaultCurrency: this.state.defaultCurrency,
                exchangeRate: Number(this.state.exchangeRate),
                active: this.state.active
            }
            console.log(updateRequest)
            await CurrenciesService.updateCurrency(updateRequest)
            this.toast("success", 'Currency updated successfully')
            this.handleBackClick();
        }
        catch (error) {
            console.error('message', error.response?.data?.message);
            const errorMessage = error.response?.data?.message || 'System error!'
            this.toast("error", errorMessage);
        }
    }

    handleBackClick = () => {
        if (this.state.isEdit) {
            this.retrieveCurrencyDetails();
            this.toggleEdit();
        } else {
            this.props.history.push(URL_CONFIG.LIST_CURRENCIES);
        }
    }

    retrieveCurrencies = async (companyUuid) => {
        try {
            const response = await CurrenciesService.getCurrencies(companyUuid)
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                console.log(responseData);
                var currencyList = responseData;
                currencyList.forEach((row) => {
                    this.setState({ hasDefault: row.defaultCurrency ? false : row.defaultCurrency })
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

    toggleEdit = () => this.setState({ isEdit: !this.state.isEdit });

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={debounce(this.handleValidSubmit)} onInvalidSubmit={debounce(this.handleInvalidSubmit)}>
                    <Container fluid className={classes['custom-container']}>
                        <HeaderMain
                            title={t('CurrencyDetails')}
                            className="mb-3"
                        />
                        <Card>
                            <CardHeader tag="h6">
                                {t('CurrencyDetails')}
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
                                                disabled
                                                validate={{
                                                    required: { value: true, errorMessage: t('PleaseSelectCurrency') }
                                                }}>
                                                <option key="" value="">{t('PleaseSelectCurrency')}</option>
                                                {this.state.currencyCodeList.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
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
                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="number"
                                                name="exchangeRate"
                                                label={t('ExchangeRate')}
                                                placeholder={t('ExchangeRate')}
                                                onChange={this.changeExchangeRateHandler}
                                                value={this.state.exchangeRate}
                                                disabled={!this.state.isEdit}
                                                validate={{
                                                    min: { value: 0 },
                                                    number: { value: true, errorMessage: t('ExchangeRateValidation') },
                                                    required: { value: true, errorMessage: t('ExchangeRateValidation') },
                                                }}
                                                onBlur={() => this.setState({ exchangeRate: this.state.exchangeRate.toFixed(6) })}
                                                required />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    {this.state.previousDefaultStatus === false &&
                                        <Col lg={4}>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox"
                                                    name="defaultCurrency"
                                                    id="checkboxesStackedCustom1"
                                                    label="Set Default Currency"
                                                    checked={this.state.defaultCurrency}
                                                    onChange={e => this.selectDefaultCurrency(e)}
                                                    className={`${classes['checkBox']}`}
                                                    disabled={!this.state.isEdit || this.state.hasDefault}
                                                />
                                            </FormGroup>
                                        </Col>
                                    }
                                    {this.state.previousDefaultStatus === true &&
                                        <Col lg={4}>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox"
                                                    name="defaultCurrency"
                                                    id="checkboxesStackedCustom1"
                                                    label="Set Default Currency"
                                                    checked={this.state.previousDefaultStatus}
                                                    onChange={e => this.selectDefaultCurrency(e)}
                                                    disabled
                                                    className={`${classes['checkBox']}`}
                                                />
                                            </FormGroup>
                                        </Col>
                                    }
                                </Row>
                                <Row>
                                    {this.state.previousDefaultStatus === false &&
                                        <Col lg={4}>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox"
                                                    name="active"
                                                    id="checkboxesStackedCustom2"
                                                    label="Set Active Status"
                                                    checked={this.state.active}
                                                    disabled={!this.state.isEdit || this.state.defaultCurrency}
                                                    onChange={e => this.selectActive(e)}
                                                    className={`${classes['checkBox']}`}
                                                />
                                            </FormGroup>
                                        </Col>
                                    }
                                    {this.state.previousDefaultStatus === true &&
                                        <Col lg={4}>
                                            <FormGroup>
                                                <CustomInput
                                                    type="checkbox"
                                                    name="active"
                                                    id="checkboxesStackedCustom2"
                                                    label="Set Active Status"
                                                    checked={this.state.active}
                                                    disabled
                                                    className={`${classes['checkBox']}`}
                                                />
                                            </FormGroup>
                                        </Col>
                                    }
                                </Row>
                            </CardBody>
                        </Card>
                    </Container>
                    <StickyFooter>
                        <Row className="justify-content-between px-3 mx-0">
                            <Button type="button" color="secondary" className={`mr-2 px-3`} onClick={this.handleBackClick}>
                                {t('Back')}
                            </Button>
                            {this.state.isEdit && <Button type="submit" className={`mr-2 px-3`} color="primary">{t('Save')}</Button>}
                            {(!this.state.isEdit && this.state.handleRole?.write)
                                && (
                                    <Button type="button" onClick={this.toggleEdit} className="mr-2 px-3 btn-facebook" color="secondary">
                                        {t('Edit')}
                                        <i className="fa fa-pencil ml-2" />
                                    </Button>
                                )
                            }
                        </Row>
                    </StickyFooter>
                </AvForm>
            </React.Fragment>
        )
    }
}

const CurrencyDetails = withTranslation()(CurrencyDetails1);
export default CurrencyDetails;
