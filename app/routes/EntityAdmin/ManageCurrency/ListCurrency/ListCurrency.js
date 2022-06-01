import React from 'react';
import { Link } from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
    Container,
    Row,
    Col,
    ButtonToolbar,
    ButtonGroup,
    Button,
    Media,
} from 'components';
import {
    AgGridReact
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './ListCurrency.scss';
import { ToastContainer, toast } from 'react-toastify';
import URL_CONFIG from 'services/urlConfig'
import CurrenciesService from 'services/CurrenciesService';
import CSVTemplate from "helper/commonConfig/CSVTemplates";
import { CSVLink } from "react-csv"

import { CommonConfirmDialog } from "routes/components";
import UploadButton from "routes/components/UploadButton";
import { clearNumber, formatDisplayDecimal } from "helper/utilities";
import PrivilegesService from 'services/PrivilegesService';
import { FEATURE } from 'helper/constantsDefined';
import CSVHelper from 'helper/CSVHelper';
import Currencies from '/public/assets/Currencies.jsx'

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

const nameRenderer = ({ data }) => `
        <span class="text-inverse">
            ${data.name}
        </span>
    `;
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

class ListCurrency1 extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            isLoading: false,
            activationShow: false,
            deactivationShow: false,
            activationButtonVisibility: "hidden",
            activateOne: true,
            deactivateOne: true,
            selectedCurrencyCode: "",
            errorMessage: '',
            successMessage: '',
            companyUuid: '',
            gridApi: null,
            columnApi: null,
            currencies: [],
            quickFilterValue: '',
            defaultColDef: {
                editable: false,
                filter: 'agTextColumnFilter',
                floatingFilter: true,
                resizable: true,
            },
            handleRole: {
                load: false,
                read: false,
                write: false,
                approve: false
            },
            columnDefs: (write) => [
                {
                    headerName: "Currency Code",
                    field: "currencyCode",
                    headerCheckboxSelection: write,
                    headerCheckboxSelectionFilteredOnly: write,
                    checkboxSelection: ({ data }) => (!data.defaultCurrency && write)
                },
                {
                    headerName: "Currency Name",
                    field: "currencyName",
                },
                {
                    headerName: "Exchange Rate",
                    field: "exchangeRate",
                    valueFormatter: ({ value }) => formatDisplayDecimal(value, 6),
                    cellStyle: { textAlign: "right" }
                },
                {
                    headerName: "Is Default",
                    field: "defaultCurrency",
                    resizable: true,
                    valueGetter: ({ data }) => data.defaultCurrency ? "Yes" : "No",
                },
                {
                    field: "updatedOn",
                    sort: 'desc',
                    sortIndex: 0,
                    hide: true,
                },
                {
                    headerName: "Is Active",
                    field: "active",
                    sort: 'desc',
                    sortIndex: 1,
                    valueGetter: ({ data }) => data.active ? "Yes" : "No",
                },
                {
                    headerName: "Action",
                    field: "action",
                    cellRenderer: this.viewRenderer,
                    filter: false,
                    hide: !write
                }
            ]
        };
        this.buttonRef = React.createRef();
        this.gridApi = null;
        this.columnApi = null;

        this.onGridReady = this.onGridReady.bind(this);
        this.onModelUpdated = this.onModelUpdated.bind(this);
        this.onQuickFilterChange = this.onQuickFilterChange.bind(this);
        this.retrieveCurrencies = this.retrieveCurrencies.bind(this);
        this.selectCurrency = this.selectCurrency.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.selectCell = this.selectCell.bind(this);
        this.handleDeactivationClose = this.handleDeactivationClose.bind(this);
        this.handleDeactivationShow = this.handleDeactivationShow.bind(this);
        this.handleActivationClose = this.handleActivationClose.bind(this);
        this.handleActivationShow = this.handleActivationShow.bind(this);
        this.handleActivation = this.handleActivation.bind(this);
        this.handleDeactivation = this.handleDeactivation.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
        this.handleActivationCurrencies = this.handleActivationCurrencies.bind(this);
        this.handleDeactivationCurrencies = this.handleDeactivationCurrencies.bind(this);
        this.activatingCurrency = this.activatingCurrency.bind(this);
        this.deactivatingCurrency = this.deactivatingCurrency.bind(this);
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

    state = {
        layouts: _.clone(LAYOUT)
    }
    componentDidMount() {
        this.getRole();
        var companyDetails = JSON.parse(localStorage.getItem('companyRole'))
        this.setState({ companyUuid: companyDetails.companyUuid })
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
            console.log("getRole= ~ handleRole", handleRole);
            this.setState({ handleRole })
        } catch (err) {
            console.log(err);
        }
    }

    viewRenderer = params => {
        if (!params.data.defaultCurrency) {
            if (params.data.active) {
                return '<span style="color:red; cursor: pointer;"><i class="fa fa-close" style="font-size:15px;color:red"></i>         Deactivate</span>'
            } else {
                return '<span style="color:navy; cursor: pointer;"><i class="fa fa-plus" style="font-size:15px;color:navy"></i>         Reactivate</span>'
            }
        }
    }

    retrieveCurrencies = async () => {
        try {
            const response = await CurrenciesService.getCurrencies(this.state.companyUuid)
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                console.log(responseData);
                this.gridApi.setRowData(responseData)
                this.setState((prevState) => ({
                    ...prevState,
                    activationButtonVisibility: "hidden"
                }))
            }
            else {
                throw new Error(response.data.message)
            }
        } catch (error) {
            console.error('message', error.response?.data?.message)
            const errorMessage = error.response?.data?.message || 'System error!'
            this.setState({ errorMessage })
            this.showToast()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.gridApi) {
            if (this.state.quickFilterValue !== prevState.quickFilterValue) {
                this.gridApi.setQuickFilter(this.state.quickFilterValue);
            }
        }
    }

    onModelUpdated() {
        if (this.gridApi) {
            const model = this.gridApi.getModel();
            const visibleCount = model.getRowCount();
            this.setState({ visibleCount });
        }
    }

    onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        this.gridApi = params.api;
        this.retrieveCurrencies();
        this.columnApi = params.columnApi;
    }

    onQuickFilterChange(e) {
        this.setState({ quickFilterValue: e.target.value });
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
        })
    }

    selectCurrency(event) {
        this.props.history.push(URL_CONFIG.CURRENCY_DETAILS + event.data.currencyCode)
    }

    handleExport() {
        console.log(this.gridApi)
        this.gridApi.exportDataAsCsv({
            columnKeys: ["currencyCode", "currencyName", "exchangeRate", "defaultCurrency", "active"],
            fileName: CSVTemplate.Currency_List_DownloadFileName
        });
    }



    handleOpenDialog = (e) => {
        console.log("handleOpenDialog")
        console.log(this.buttonRef)
        // Note that the ref is set async, so it might be null at some point
        if (this.buttonRef.current) {
            this.buttonRef.current.open(e)
        }
    }

    handleOnError = (err, file, inputElem, reason) => {
        message = err
        __showToast('error')
    }

    handleOnDrop = async (csvData) => {
        this.setState({ isLoading: true });

        try {
            const massUpload = [];
            for (let i = 0; i < csvData.length; i++) {
                if (csvData[i].data[0] !== "" && !csvData[i].data[0].includes("Currency Code")) {
                    const validationResult = CSVHelper.validateCSV(csvData, ["Currency Code", "Exchange Rate", "Is Default", "Is Active"]);
                    if (validationResult.missingField) {
                        throw new Error(`Validate Error: Please select valid  ${validationResult.missingField}`);
                    } else if (!validationResult.validate) {
                        throw new Error(CSVTemplate.NeededFields_Error);
                    }
                    const currencyName = Currencies?.currencies?.find((item) => item.code === csvData[i].data[0])?.name;
                    if (!currencyName) {
                        throw new Error(`Row ${i+1}: Please select valid Currency Code`);
                    }
                    const uploadItem = {
                        currencyCode: csvData[i].data[0],
                        currencyName: currencyName,
                        exchangeRate: Number(clearNumber(csvData[i].data[1])) + "",
                        defaultCurrency: csvData[i].data[2]?.toLowerCase() === "yes",
                        active: csvData[i].data[3]?.toLowerCase() === "yes",
                    };
                    massUpload.push(uploadItem);
                }
            }
            console.log('masUpload', massUpload);
            const payload = {
                companyUuid: this.state.companyUuid,
                currencyList: massUpload
            }
            await CurrenciesService.massUploadCurrency(payload);
            this.setState({ successMessage: 'Mass Upload Done' })
            this.showSuccessToast();
            this.retrieveCurrencies()
        } catch (e) {
            this.setState({ errorMessage: e?.response?.data?.message || e?.message })
            this.showToast()
        }
        this.setState({ isLoading: false });
    }

    handleDeactivationClose = () => this.setState({ deactivationShow: false });
    handleDeactivationShow = () => this.setState({ deactivationShow: true });
    handleActivationClose = () => this.setState({ activationShow: false });
    handleActivationShow = () => this.setState({ activationShow: true });

    selectCell = (event) => {
        if (event.colDef.headerName == "Action") {
            console.log(event)
            this.setState({ selectedCurrencyCode: event.data.currencyCode })
            if (event.data.active) {
                this.setState({ deActivateOne: true })
                this.handleDeactivationShow()
            } else {
                this.setState({ activateOne: true })
                this.handleActivationShow()
            }
        }
    }

    handleActivation = () => {
        this.activatingCurrency([this.state.selectedCurrencyCode]);
    }

    handleActivationCurrencies = () => {
        let selectedNodes = this.gridApi.getSelectedNodes();
        let selectedData = selectedNodes.filter((node) => !node.data.defaultCurrency).map(node => node.data.currencyCode);
        console.log(selectedData)
        this.activatingCurrency(selectedData);
    }

    activatingCurrency = (currenciesCodeList) => {
        this.handleActivationClose()
        CurrenciesService.activateCurrency(this.state.companyUuid, currenciesCodeList).then((res) => {
            if (res.data.status === "OK") {
                this.setState({ successMessage: res.data.message })
                this.showSuccessToast()
                this.retrieveCurrencies()
            } else {
                this.setState({ errorMessage: res.data.message })
                this.showToast()
            }
        }).catch(error => {
            this.setState({ errorMessage: error.response?.data?.message })
            this.showToast()
        });
    }

    handleDeactivation = () => {
        this.deactivatingCurrency([this.state.selectedCurrencyCode]);
    }

    handleDeactivationCurrencies = () => {
        let selectedNodes = this.gridApi.getSelectedNodes();
        let selectedData = selectedNodes.filter((node) => !node.data.defaultCurrency).map(node => node.data.currencyCode);
        console.log(selectedData)
        this.deactivatingCurrency(selectedData);
    }

    deactivatingCurrency = (currenciesCodeList) => {
        this.handleDeactivationClose()
        CurrenciesService.deactivateCurrency(this.state.companyUuid, currenciesCodeList).then((res) => {
            console.log(res)
            if (res.data.status === "OK") {
                this.setState({ successMessage: res.data.message })
                this.showSuccessToast()
                this.retrieveCurrencies()
            } else {
                this.setState({ errorMessage: res.data.message })
                this.showToast()
            }
        }).catch(error => {
            this.setState({ errorMessage: error.response?.data?.message })
            this.showToast()
        });
    }

    onSelectionChanged = () => {
        let selectedNodes = this.gridApi.getSelectedNodes();
        if (selectedNodes.length > 0) {
            this.setState({ activationButtonVisibility: "visible" })
        } else {
            this.setState({ activationButtonVisibility: "hidden" })
        }
    }

    render() {
        const { t, i18n } = this.props;
        return (
            <React.Fragment>
                <Container fluid={true}>
                    <div className="d-flex mb-2">
                        <HeaderMain
                            title={t('List of Currency')}
                            className="mb-3 mb-lg-3"
                        />
                    </div>
                    <div className="d-flex mb-2">
                        <div>
                            <Button color="primary" className="mb-2 mr-2 px-3" style={{ visibility: this.state.activationButtonVisibility }} onClick={() => { this.setState({ activateOne: false }); this.handleActivationShow() }}>{t("Activate")}</Button>
                            <Button color="danger" className="mb-2 mr-2 px-3" style={{ visibility: this.state.activationButtonVisibility }} onClick={() => { this.setState({ deactivateOne: false }); this.handleDeactivationShow() }}>{t("Deactivate")}</Button>
                        </div>
                        <ButtonToolbar className="ml-auto">
                            <Button color="secondary" className="mb-2 mr-2 px-3" onClick={this.handleExport}>
                                <i className="fa fa-download" />                    Download
                            </Button>
                            {this.state.handleRole?.write && (
                                <>
                                    <UploadButton
                                        isLoading={this.isLoading}
                                        buttonRef={this.buttonRef}
                                        translation={t}
                                        handleOnDrop={this.handleOnDrop}
                                        handleOnError={this.handleOnError}
                                        handleOpenDialog={this.handleOpenDialog}
                                    />
                                    <Button color="primary" className="mb-2 mr-2 px-3">
                                        <CSVLink data={CSVTemplate.Currency_List_Data} headers={CSVTemplate.Currency_List_Headers} filename={CSVTemplate.Currency_List_TemplatesFilename} style={{ color: "white" }}>
                                            <i className="fa fa-download" /> {t('Template')}
                                        </CSVLink>
                                    </Button>
                                    <Link to={URL_CONFIG.CREATE_CURRENCY}>
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <i className="fa fa-plus" />                    Create New
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </ButtonToolbar>
                    </div>
                    <div className="ag-theme-custom-react" style={{ height: '500px' }}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs(this.state.handleRole?.write)}
                            defaultColDef={this.state.defaultColDef}
                            rowData={[]}
                            pagination='true'
                            paginationPageSize={10}
                            onGridReady={this.onGridReady}
                            onCellDoubleClicked={this.selectCurrency}
                            rowSelection='multiple'
                            onCellClicked={this.selectCell}
                            suppressRowClickSelection={true}
                            modules={this.state.modules}
                            onSelectionChanged={this.onSelectionChanged}
                        />
                    </div>
                    <CommonConfirmDialog
                        isShow={(this.state.activationShow || this.state.deactivationShow) ? true : false}
                        onHide={this.state.activationShow ? this.handleActivationClose : this.handleDeactivationClose}
                        title={this.state.activationShow ? t("Activation") : t("Deactivation")}
                        content={`Are you sure you want to ${this.state.activationShow ? "activate" : "deactivate"}?`}
                        positiveProps={
                            {
                                onPositiveAction: (
                                    this.state.activationShow ? (
                                        this.state.activateOne ? this.handleActivation : this.handleActivationCurrencies
                                    ) : (this.state.deactivateOne ? this.handleDeactivation : this.handleDeactivationCurrencies)

                                ),
                                contentPositive: this.state.activationShow ? "Activate" : "Deactivate",
                                colorPositive: this.state.activationShow ? "primary" : "danger"
                            }

                        }
                        negativeProps={
                            {
                                onNegativeAction: this.state.activationShow ? this.handleActivationClose : this.handleDeactivationClose,
                                colorNegative: "link",
                            }
                        }
                    >
                    </CommonConfirmDialog>
                </Container>
            </React.Fragment>
        );
    }
}
const ListCurrency = withTranslation()(ListCurrency1);
export default ListCurrency;
