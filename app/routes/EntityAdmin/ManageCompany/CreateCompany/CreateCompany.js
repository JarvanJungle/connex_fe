import React from 'react';
import Countries from '/public/assets/Countries.jsx'
import URL_CONFIG from 'services/urlConfig'
import { Link } from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { AvForm, AvField } from 'availity-reactstrap-validation';

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
    Label, Nav, NavItem, NavLink, Input,
} from 'components';
import {
    AgGridReact,
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './CreateCompany.scss';
import EntitiesService from 'services/EntitiesService'
import { StickyFooter } from 'components/StickyFooter/StickyFooter';
import CompaniesService from 'services/CompaniesService';
import useToast from "routes/hooks/useToast";
import PrivilegesService from "services/PrivilegesService";
import {debounce, formatDateString} from "helper/utilities";
import uuid from "uuid/v4";
import CompanyLogo from '../CompanyDetails/components/CompanyLogo';

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

const toast = useToast();

class CreateCompany1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            successMessage: '',
            errorMessage: '',
            quickFilterValue: '',
            companyName: '',
            buyer: true,
            supplier: false,
            coreModules: [],
            assignedFeatures: {},
            moduleCheckedAll: {},
            companyRegistrationNumber: '',
            country: '',
            entityType: '',
            entityIndustry: '',
            entityTypeList: [],
            industryTypeList: [],
            selectedGSTOption: '',
            countryList: Countries.countries,
            gstApplicable: false,
            logoUrl: "",
            defaultColDef: {
                editable: true,
                filter: 'agTextColumnFilter',
                sizeColumnsToFit: true,
                autoSizeAllColumns: true,
                floatingFilter: true,
                resizable: true,
            },
            documentTableColDefs: [
                {
                    headerName: this.props.t('Title'),
                    field: "title",
                    cellStyle: () => ({
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    })

                },
                {
                    headerName: this.props.t('FileName'),
                    field: "fileName",
                    editable: false,
                },
                {
                    headerName: this.props.t('Created Date'),
                    field: "createdAt",
                    editable: false,
                    valueFormatter: ({ value }) => formatDateString(value)
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "delete",
                    cellRenderer: this.deleteRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                }
            ],
            documentList: [],
            activeTab: 1,
            documentGrid: true,
            gstNo: 'N/A',
            documentTitleErrors: false,
            ifSubmit: false,
            rowUsers: []
        };
        this.onValueChangeGST = this.onValueChangeGST.bind(this);
        this.changeGSTRegistrationNoHandler = this.changeGSTRegistrationNoHandler.bind(this);
        this.changeCompanyNameHandler = this.changeCompanyNameHandler.bind(this);
        this.changeCompanyRegistrationNumberHandler = this.changeCompanyRegistrationNumberHandler.bind(this);
        this.changeEntityTypeHandler = this.changeEntityTypeHandler.bind(this);
        this.changeEntityIndustryHandler = this.changeEntityIndustryHandler.bind(this);

        this.handleFileUpload = this.handleFileUpload.bind(this)

        this.gridApi = null;

        this.onGridReady = this.onGridReady.bind(this);
        this.onModelUpdated = this.onModelUpdated.bind(this);
        this.onQuickFilterChange = this.onQuickFilterChange.bind(this);
        this.onCellValueChanged = this.onCellValueChanged.bind(this);
        this.deleteRowClicked = this.deleteRowClicked.bind(this);

        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.retrieveEntityTypeList = this.retrieveEntityTypeList.bind(this);
        this.retrieveIndustryTypeList = this.retrieveIndustryTypeList.bind(this);
    }

    componentDidMount() {
        this.retrieveEntityTypeList();
        this.retrieveIndustryTypeList();
        this.retrieveDoxaCoreModule();
    }

    retrieveEntityTypeList = async () => {
        try {
            const response = await EntitiesService.retrieveEntityType();
            const responseData = response.data.data;
            console.log(response);
            if (response.data.status == "OK") {
                this.setState({ entityTypeList: responseData })
            }
            else {
                this.props.history.push(URL_CONFIG.LIST_COMPANIES)
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            toast("error", errorMessage);
        }
    }

    async retrieveDoxaCoreModule() {
        try {
            const response = await PrivilegesService.getListAllFeatures();
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ coreModules: responseData })
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            toast("error", errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    retrieveIndustryTypeList = async () => {
        try {
            const response = await EntitiesService.retrieveIndustryType();
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ industryTypeList: responseData })
            }
            else {
                this.props.history.push(URL_CONFIG.LIST_COMPANIES)
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            toast("error", errorMessage);
        }
    }

    changeCompanyNameHandler = (event) => {
        this.setState({ companyName: event.target.value.toUpperCase() })

    }

    changeCompanyRegistrationNumberHandler = (event) => {
        this.setState({ companyRegistrationNumber: event.target.value.toUpperCase() })

    }

    changeGSTRegistrationNoHandler = (event) => {
        this.setState({ gstNo: event.target.value })

    }

    changeEntityTypeHandler = (event) => {
        this.setState({ entityType: event.target.value })

    }

    changeEntityIndustryHandler = (event) => {
        this.setState({ entityIndustry: event.target.value })

    }

    selectCountry = (event) => {
        this.setState({ country: event.target.value });
    }

    onValueChangeGST(event) {
        this.setState({
            selectedGSTOption: event.target.value
        });
        if (event.target.value == "yes") {
            this.setState({ gstApplicable: true, gstNumberErrors: true });
            this.setState({ gstNo: "" });
        }
        else {
            this.setState({ gstApplicable: false });
            this.setState({ gstNo: "N/A" });
            this.setState({ gstNumberErrors: false });
        }
    }

    handleClickActiveTab(currentTab) {
        this.setState({ activeTab: currentTab });
    }

    handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            let file = event.target.files[0];
            data.append('file', event.target.files[0]);
            data.append('category', "entity-management/company-documents")
            data.append('uploaderRole', "user")
            let self = this;
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.createNewRowData(responseData.fileName, responseData.guid);
            }
            else {
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'System error!'
            this.setState({ errorMessage });
            toast("error", errorMessage);
        }
    }

    createNewRowData(fileName, guidResponse) {
        let arr = this.state.documentList.slice();
        let newRow = {
            title: '',
            fileName: fileName,
            guid: guidResponse,
            createdAt: formatDateString(new Date(), 'YYYY-MM-DD HH:mm:ss'),
            updatedAt: formatDateString(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        }
        this.setState({
            documentTitleErrors: true,
        })
        arr.push(newRow)
        this.setState({ documentList: arr });
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

    onGridReady({ api }) {
        this.gridApi = api;

    }

    onQuickFilterChange(e) {
        this.setState({ quickFilterValue: e.target.value });
    }

    onCellValueChanged(event) {
        let arr = [];
        let documentTitleCheck = 0;
        let documentTypeCheck = 0;
        this.state.documentList.forEach(document => {
            if (document.fileName == event.data.fileName && document.title == event.data.title) {
                arr.push(event.data);
            }
            else {
                arr.push(document);
            }
        });

        this.state.documentList.forEach(document => {
            if (document.title == "") {
                documentTitleCheck += 1;
            }
            if (document.type == "") {
                documentTypeCheck += 1;
            }
        });
        if (documentTitleCheck > 0) {
            this.setState({ documentTitleErrors: true })
        }
        else {
            this.setState({ documentTitleErrors: false })
        }
        this.setState({ documentList: arr });
        this.setState({ documentGrid: !this.state.documentGrid });
    }

    deleteRenderer = params => {
        return '<span><i class="fa fa-trash-o" style="font-size:15px;color:red"></i></span>'
    }

    deleteRowClicked = async (event) => {
        if (event.colDef.headerName == "Action") {
            try {
                const response = await EntitiesService.deleteDocuments(event.data.guid);
                const responseData = response.data.data;
                if (response.data.status == "OK") {
                    let arr = [];
                    this.state.documentList.forEach(document => {
                        if (document.fileName != event.data.fileName) {
                            arr.push(document);
                        }
                    });
                    this.setState({ documentList: arr });
                    this.setState({ documentGrid: !this.state.documentGrid });
                }
                else {
                    throw new Error(response.data.message)
                }
            }
            catch (error) {
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                toast("error", errorMessage);
            }
            if (this.state.documentList.length == 0) {
                this.setState({ documentTitleErrors: false })
            }
        }
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.setState({ errorMessage: 'Validation error, please check your input' })
        toast("error", 'Validation error, please check your input');

    }

    handleSelectedFeature(featureCode, { moduleCode, features }) {
        this.setState((state) => {
            state.assignedFeatures[featureCode] = !state.assignedFeatures[featureCode];
            state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            return state;
        })
    }

    changeModuleCheckedAll(module) {
        this.setState((state) => {
            module.features.forEach(({ featureCode }) => {
                state.assignedFeatures[featureCode] = !state.moduleCheckedAll[module.moduleCode]
            })
            state.moduleCheckedAll[module.moduleCode] = !state.moduleCheckedAll[module.moduleCode];
            return state;
        })
    }


    handleValidSubmit = async (e) => {
        if (!(this.state.buyer || this.state.supplier)) {
            this.setState({ ifSubmit: true })
            toast('error', 'Validation error, please choose at least one role');
            return;
        }
        this.setState({ ifSubmit: true })
        if (!this.state.documentTitleErrors) {
            let createRequest = {
                remarks: this.state.remarks,
                buyer: this.state.buyer,
                supplier: this.state.supplier,
                gstNo: this.state.gstNo,
                entityName: this.state.companyName,
                companyRegistrationNumber: this.state.companyRegistrationNumber,
                country: this.state.country,
                entityType: this.state.entityType,
                industryType: this.state.entityIndustry,
                gstApplicable: this.state.gstApplicable,
                documentsMetaDataList: this.state.documentList,
                logoUrl: this.state.logoUrl
            }
            createRequest['features'] = Object.keys(this.state.assignedFeatures).filter(k => this.state.assignedFeatures[k]);

            try {
                const response = await CompaniesService.createCompany(createRequest)
                if (response.data.status == "OK") {
                    this.props.history.push(URL_CONFIG.LIST_COMPANIES)
                    this.setState({ successMessage: 'Company Creation Successful' })
                    toast("success", 'Company Creation Successful')
                }
                else {
                    console.log(response);
                    throw new Error(response.data.message)
                }
            }
            catch (error) {
                console.log(error);
                this.setState({ errorMessage: error?.response?.data?.message || error?.message })
                toast("error", error?.response?.data?.message || error?.message);
            }
        } else {
            this.setState({ errorMessage: 'Validation error, please check your input' })
            toast("error", 'Validation error, please check your input')
        }
    }

    changeUrl(url){
        console.log(url)
        this.setState({logoUrl: url});
    }

    render() {
        const { t } = this.props;
        const { selectedGSTOption } = this.state;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={debounce(this.handleValidSubmit)} onInvalidSubmit={debounce(this.handleInvalidSubmit)}>
                    <Container fluid className={classes['custom-container']}>
                        <HeaderMain
                            title={t('CreateCompany')}
                            className="mb-3"
                        />
                        <Card className="mb-3">
                            <CardHeader tag="h6">
                                {t('Roles')}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg={12}>
                                        <FormGroup>
                                            <div className="gstButtons">
                                                <CustomInput
                                                    type="checkbox"
                                                    id="buyer" name="buyer" value={this.state.buyer}
                                                    checked={this.state.buyer}
                                                    inline
                                                    className={classes['custom-control']}
                                                    onChange={() => this.setState({ ...this.state, buyer: !this.state.buyer })}
                                                    label="Buyer"
                                                />
                                                <CustomInput
                                                    type="checkbox"
                                                    className={classes['custom-control']}
                                                    id="supplier" name="supplier" value={this.state.supplier}
                                                    checked={this.state.supplier}
                                                    onChange={() => this.setState({ ...this.state, supplier: !this.state.supplier })}
                                                    inline
                                                    label="Supplier"
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader tag="h6">
                                {t('CompanyInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="companyName"
                                                label={t('CompanyName')}
                                                placeholder={t('EnterCompanyName')}
                                                value={this.state.companyName}
                                                onChange={this.changeCompanyNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterCompanyName') },
                                                    minLength: { value: 2, errorMessage: t('CompanyNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('CompanyNameValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="comRegNo"
                                                label={t('CompanyRegistrationNumber')}
                                                placeholder={t('EnterCompanyRegistrationNumber')}
                                                value={this.state.companyRegistrationNumber}
                                                onChange={this.changeCompanyRegistrationNumberHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterCompanyRegistrationNumber') },
                                                    minLength: { value: 2, errorMessage: t('CompanyRegistrationNumberValidation') },
                                                    maxLength: { value: 50, errorMessage: t('CompanyRegistrationNumberValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="country"
                                                label={t('OriginCountry')}
                                                value={this.state.country}
                                                onChange={e => this.selectCountry(e)}
                                                validate={{
                                                    required: { value: true, errorMessage: t('PleaseSelectCountry') }
                                                }}>
                                                <option key="" value="">{t('PleaseSelectCountry')}</option>
                                                {this.state.countryList.map((country) => <option key={country.name} value={country.name}>{country.name}</option>)}
                                            </AvField>
                                        </FormGroup>
                                    </Col>

                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="entityType1"
                                                label={t('EntityType')}
                                                value={this.state.entityType}
                                                onChange={e => this.changeEntityTypeHandler(e)}
                                                validate={{
                                                    required: { value: true, errorMessage: t('PleaseSelectEntityType') }
                                                }}>
                                                <option key="" value="">{t('PleaseSelectEntityType')}</option>
                                                {this.state.entityTypeList.map((entityType) => <option key={entityType.entityType} value={entityType.entityType}>{entityType.entityType}</option>)}
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="entityIndustry1"
                                                label={t('IndustryType')}
                                                value={this.state.industryType}
                                                onChange={e => this.changeEntityIndustryHandler(e)}
                                                validate={{
                                                    required: { value: true, errorMessage: t('PleaseSelectIndustryType') }
                                                }}>
                                                <option key="" value="">{t('PleaseSelectIndustryType')}</option>
                                                {this.state.industryTypeList.map((industryType) => <option key={industryType.industryType} value={industryType.industryType}>{industryType.industryType}</option>)}
                                            </AvField>
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup>
                                            <Label for="GST Applicable*">
                                                {t('Tax-Registered Business')} <span className="text-danger"> *</span>
                                            </Label>
                                            <div className="gstButtons">
                                                <CustomInput
                                                    type="radio"
                                                    id="yesGST" name="gstApplicable" value="yes"
                                                    onChange={this.onValueChangeGST}
                                                    inline
                                                    className={classes['custom-control']}
                                                    label="Yes"
                                                ></CustomInput>
                                                <CustomInput
                                                    type="radio"
                                                    className={classes['custom-control']}
                                                    id="noGST" name="gstApplicable" value="no"
                                                    onChange={this.onValueChangeGST}
                                                    inline
                                                    label="No"
                                                    defaultChecked
                                                ></CustomInput>
                                            </div>

                                        </FormGroup>
                                    </Col>

                                    {selectedGSTOption == "yes" &&
                                        <Col lg={4}>
                                            <FormGroup className="label-required">
                                                <AvField
                                                    type="text"
                                                    name="gstRegNo"
                                                    label={t('Tax Reg. No.')}
                                                    placeholder={t('EnterGSTRegistrationNumber')}
                                                    value={this.state.gstNo}
                                                    onChange={this.changeGSTRegistrationNoHandler}
                                                    validate={{
                                                        required: { value: true, errorMessage: t('Tax Reg. No. is required') },
                                                        minLength: { value: 2, errorMessage: t('CompanyGstNumberValidation') },
                                                        maxLength: { value: 50, errorMessage: t('CompanyGstNumberValidation') }
                                                    }}
                                                    required />
                                            </FormGroup>
                                        </Col>
                                    }
                                </Row>

                            </CardBody>
                        </Card>
                        <div>
                            <Nav tabs className="mt-3">
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 1 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 1)}>
                                        <i className="fa fa-fw fa-file-text mr-2"></i>
                                        <span className={classes['navTabs']}>Documents</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 3 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 3)}>
                                        <i className="fa fa-fw fa-check-square mr-2"></i>
                                        <span className={classes['navTabs']}>Module Subscription</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 6 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 6)}>
                                        <i className="fa fa-fw fa-upload mr-2"></i>
                                        <span className={classes['navTabs']}>Company Logo</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 5 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 5)}>
                                        <i className="fa fa-fw fa-pencil-square-o mr-2"></i>
                                        <span className={classes['navTabs']}>Remarks</span>
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            {this.state.activeTab == 1 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>
                                                <div>
                                                    <input
                                                        ref="fileInput"
                                                        onChange={this.handleFileUpload}
                                                        type="file"
                                                        style={{ display: "none" }}
                                                    />
                                                    <Button color="primary" className={`${classes['inputTextButton']} mb-2`} onClick={() => this.refs.fileInput.click()}>
                                                        <i className="fa fa-plus" /> {t('Add')}
                                                    </Button>
                                                </div>
                                                <div>
                                                    {this.state.documentTitleErrors && this.state.ifSubmit &&
                                                        <p className={classes['errorText2']}>{t('DocumentTitleValidation')}</p>
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col lg>
                                                <div className="ag-theme-custom-react" style={{ height: '300px', width: '100%' }}>
                                                    <AgGridReact
                                                        columnDefs={this.state.documentTableColDefs}
                                                        defaultColDef={this.state.defaultColDef}
                                                        rowData={this.state.documentList}
                                                        onCellValueChanged={this.onCellValueChanged}
                                                        onCellEditingStopped={this.onCellValueChanged}
                                                        onCellClicked={this.deleteRowClicked}
                                                        onModelUpdated={this.onModelUpdated}
                                                        suppressRowClickSelection={true}
                                                        onGridReady={({ api }) => api.sizeColumnsToFit()}
                                                        stopEditingWhenCellsLoseFocus
                                                        singleClickEdit
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            }

                            {this.state.activeTab == 3 &&
                                <Card className="mt-3">
                                    <CardBody>
                                        {this.state.coreModules.map((module) =>
                                            <Row key={uuid()}>
                                                <Col lg={12}>
                                                    <Card>
                                                        <CardHeader tag="h6">
                                                            <CustomInput
                                                                type="checkbox"
                                                                id={module.moduleName}
                                                                inline
                                                                checked={this.state.moduleCheckedAll[module.moduleCode]}
                                                                className={classes['custom-control']}
                                                                onChange={() => this.changeModuleCheckedAll(module)}
                                                                label={module.moduleName}
                                                                key={module.moduleName}
                                                            />
                                                        </CardHeader>
                                                        <CardBody>
                                                            <Row>
                                                                {module.features.map((f) =>
                                                                    <Col lg={4} key={uuid()}>
                                                                        <CustomInput
                                                                            type="checkbox"
                                                                            id={f.featureCode}
                                                                            inline
                                                                            checked={this.state.assignedFeatures[f.featureCode]}
                                                                            className={classes['custom-control']}
                                                                            onChange={() => this.handleSelectedFeature(f.featureCode, module)}
                                                                            label={f.featureName}
                                                                            key={f.featureCode}
                                                                        />
                                                                    </Col>
                                                                )}
                                                            </Row>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            </Row>)}
                                    </CardBody>
                                </Card>
                            }

                            {this.state.activeTab == 5 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>

                                                <Input value={this.state.remarks}
                                                    type="textarea"
                                                    placeholder="Enter remarks"
                                                    className="w-100 form-control"
                                                    onChange={(e) => this.setState({
                                                        ...this.state,
                                                        remarks: e.target.value
                                                    })}
                                                />
                                            </Col>
                                        </Row>
                                        <br />
                                    </CardBody>
                                </Card>
                            }
                            {this.state.activeTab == 6 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Card className={`classes['navCard']`}>
                                            <CardBody className={classes['cardBody']}>
                                                <Row>
                                                    <Col lg>
                                                        <CompanyLogo sendUrl={(url) => this.changeUrl(url)} logoUrl={this.state.logoUrl} isEdit={true} />
                                                    </Col>
                                                </Row>
                                                <br />
                                            </CardBody>
                                        </Card>
                                    </CardBody>
                                </Card>
                            }
                        </div>

                        {/* END: Module Subscription */}
                    </Container>
                    <StickyFooter>
                        <Row className="justify-content-between px-3 mx-0">
                            <Link to={URL_CONFIG.LIST_COMPANIES}>
                                <Button color="secondary" className={`mr-2`}>
                                    {t('Back')}
                                </Button>
                            </Link>
                            <Button type="submit" className={`mr-2`} color="primary">{t('Create')}</Button>
                        </Row>
                    </StickyFooter>
                </AvForm>
            </React.Fragment>
        )
    }

}

const CreateCompany = withTranslation()(CreateCompany1);
export default CreateCompany;
