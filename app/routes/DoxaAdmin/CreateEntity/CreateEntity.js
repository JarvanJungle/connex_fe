import React from 'react';

import Countries from '/public/assets/Countries.jsx'

import URL_CONFIG from 'services/urlConfig'

import {Link, Prompt} from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { HeaderMain } from "routes/components/HeaderMain";
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
    Label, Nav, NavItem, NavLink
} from 'components';
import {
    AgGridReact
} from 'components/agGrid';

import classes from './CreateEntity.scss';

import EntitiesService from 'services/EntitiesService'
import { StickyFooter } from 'components/StickyFooter/StickyFooter';
import config from 'config/config';
import PrivilegesService from 'services/PrivilegesService';
import {convertToLocalTime, formatDateString} from "helper/utilities";
import useToast from "routes/hooks/useToast";
import {Input} from "reactstrap";
import DialCodes from "/public/assets/DialCodes.js";
import {v4 as uuidv4} from "uuid";

// import {
//     createAutoCorrectedDatePipe,
//     createNumberMask,
// } from 'text-mask-addons';


// const autoCorrectedDatePipe = createAutoCorrectedDatePipe('mm/dd/yyyy');
// const dolarsMask = createNumberMask({ prefix: '$' });
// const dolarsMaskDecimal = createNumberMask({ prefix: '$', allowDecimal: true });
// const percentageMask = createNumberMask({ prefix: '', suffix: '%', integerLimit: 3 });
// const upperCasePipe = conformedValue => conformedValue.toUpperCase();
const showToast = useToast();

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

class CreateEntity1 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // Doxa core modules
            isDirty: true,
            coreModules: [],
            assignedFeatures: {},
            moduleCheckedAll: {},
            entityRepRole: "Entity Representitive",
            authorizedSigRole: "Authorized Signatory",
            entityAdmRole: "Entity Administrator",
            errorMessage: '',
            quickFilterValue: '',
            companyName: '',
            companyRegistrationNumber: '',
            country: '',
            entityType: '',
            entityIndustry: '',
            entityTypeList: [],
            industryTypeList: [],
            selectedGSTOption: '',
            countryList: Countries.countries,
            gstApplicable: false,
            buyer: true,
            supplier: false,
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
                    valueFormatter: ({value}) => formatDateString(value)
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "delete",
                    width: 150,
                    editable: false,
                    cellRenderer: this.deleteRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                }
            ],
            documentList: [],
            activeTab: 1,
            documentGrid: true,
            gstNo: 'N/A',
            entityRepName: '',
            entityRepEmail: '',
            entityRepDialog: '',
            entityRepPhone: '',
            authorizedSigName: '',
            authorizedSigEmail: '',
            authorizedSigDialog: '',
            authorizedSigPhone: '',
            selectedAutSigOption: '',
            entityAdmName: '',
            entityAdmDialog: '',
            entityAdmPhone: '',
            entityAdmEmail: '',
            selectedEntAdmOption: '',
            remarks: '',
            successMessage: "",

            entityRepNameErrors: true,
            entityRepEmailErrors: true,
            entityRepPhoneErrors: true,
            authorizedSigNameErrors: true,
            authorizedSigEmailErrors: true,
            authorizedSigPhoneErrors: true,
            entityAdmNameErrors: true,
            entityAdmPhoneErrors: true,
            entityAdmEmailErrors: true,
            documentTitleErrors: false,
            // documentTypeErrors: false,
            gstNumberErrors: false,
            ifSubmit: false,


            rowUsers: [
                {
                    userId: 1300,
                    fullName: "PR Creator 3 Testing",
                    workEmail: "prcreator3@getnada.com",
                    role: "PR CREATOR 3",
                    createdOn: "29/01/2021",
                    status: "Active",
                    mfaStatus: "Disabled"
                },
                {
                    userId: 1294,
                    fullName: "PR Creator 2 QTesting",
                    workEmail: "prcreator2q@getnada.com",
                    role: "PR CREATOR 2",
                    createdOn: "24/01/2021",
                    status: "Active",
                    mfaStatus: "Disabled"
                },
            ]
        };
        this.onValueChangeGST = this.onValueChangeGST.bind(this);
        this.changeGSTRegistrationNoHandler = this.changeGSTRegistrationNoHandler.bind(this);
        this.onValueChangeAutSig = this.onValueChangeAutSig.bind(this);
        this.onValueChangeEntAdm = this.onValueChangeEntAdm.bind(this);
        this.changeCompanyNameHandler = this.changeCompanyNameHandler.bind(this);
        this.changeCompanyRegistrationNumberHandler = this.changeCompanyRegistrationNumberHandler.bind(this);
        this.changeEntityTypeHandler = this.changeEntityTypeHandler.bind(this);
        this.changeEntityIndustryHandler = this.changeEntityIndustryHandler.bind(this);

        this.changeEntityRepNameHandler = this.changeEntityRepNameHandler.bind(this);
        this.changeEntityRepEmailHandler = this.changeEntityRepEmailHandler.bind(this);
        this.changeEntityRepPhoneHandler = this.changeEntityRepPhoneHandler.bind(this);
        this.changeAutSigNameHandler = this.changeAutSigNameHandler.bind(this);
        this.changeAutSigEmailHandler = this.changeAutSigEmailHandler.bind(this);
        this.changeAutSigPhoneHandler = this.changeAutSigPhoneHandler.bind(this);
        this.changeEntAdmNameHandler = this.changeEntAdmNameHandler.bind(this);
        this.changeEntAdmEmailHandler = this.changeEntAdmEmailHandler.bind(this);
        this.changeEntAdmPhoneHandler = this.changeEntAdmPhoneHandler.bind(this);
        this.changeRemarks = this.changeRemarks.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.onChangeValue  = this.onChangeValue.bind(this);

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
        this.handleSelectedFeature = this.handleSelectedFeature.bind(this);

        this.onValueChangeIsBuyer = this.onValueChangeIsBuyer.bind(this);
        this.onValueChangeIsSupplier = this.onValueChangeIsSupplier.bind(this);
    }

    componentDidMount() {
        this.retrieveEntityTypeList();
        this.retrieveIndustryTypeList();
        this.retrieveDoxaCoreModule();
    }

    handleSelectedFeature(featureCode, {features, moduleCode}) {
        this.setState((state) => {
            state.assignedFeatures[featureCode] = !state.assignedFeatures[featureCode];
            state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            return state;
        })

    }

    retrieveEntityTypeList = async () => {
        try{
            const response = await EntitiesService.retrieveEntityType();
            const responseData = response.data.data;
            if (response.data.status == "OK"){
                this.setState({ entityTypeList: responseData })
            }
            else{
                this.props.history.push(URL_CONFIG.LIST_ENTITIES)
                throw new Error(response.data.message)
            }
        }
        catch (error){
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({errorMessage});
            showToast('error', errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    retrieveDoxaCoreModule = async () => {
        try{
            const response = await PrivilegesService.getListAllFeatures();
            const responseData = response.data.data;
            if (response.data.status == "OK"){
                this.setState({ coreModules: responseData })
            }
        }
        catch (error){
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({errorMessage});
            showToast('error', errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    retrieveIndustryTypeList = async () => {
        try{
            const response = await EntitiesService.retrieveIndustryType();
            const responseData = response.data.data;
            if (response.data.status == "OK"){
                this.setState({ industryTypeList: responseData })
            }
            else{
                this.props.history.push(URL_CONFIG.LIST_ENTITIES)
                throw new Error(response.data.message)
            }
        }
        catch (error){
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({errorMessage});
            showToast('error', errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    changeCompanyNameHandler = (event) => {
        this.setState({ companyName: event.target.value.toUpperCase() })

    }

    changeCompanyRegistrationNumberHandler = (event) => {
        this.setState({ companyRegistrationNumber: event.target.value.toUpperCase() })

    }
    changeRemarks = (event) => {
        this.setState({ remarks: event.target.value })

    }

    changeGSTRegistrationNoHandler = (event) => {
        this.setState({ gstNo: event.target.value })

    }

    changeModuleCheckedAll = (module) => {
        this.setState((state) => {
            module.features.forEach(({featureCode}) => {
                state.assignedFeatures[featureCode] = !state.moduleCheckedAll[module.moduleCode]
            })
            state.moduleCheckedAll[module.moduleCode] = !state.moduleCheckedAll[module.moduleCode];
            return state;
        })
    }

    changeEntityTypeHandler = (event) => {
        this.setState({ entityType: event.target.value })

    }

    changeEntityIndustryHandler = (event) => {
        this.setState({ entityIndustry: event.target.value })

    }

    selectCountry = (event) => {
        const dialogCode = DialCodes?.dialCodes?.find(code => code?.label?.toLowerCase() === event?.target?.value?.toLowerCase())?.value;
        console.log(dialogCode);
        if (dialogCode) {
            this.setState({
                country: event.target.value,
                entityRepDialog: dialogCode,
                authorizedSigDialog: dialogCode,
                entityAdmDialog: dialogCode,
            });

        } else {
            this.setState({
                country: event.target.value
            });
        }
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

    onValueChangeAutSig(event) {
        this.setState({
            selectedAutSigOption: event.target.value
        });
        if (event.target.value == 'yes') {
            this.setState({
                authorizedSigName: this.state.entityRepName,
                authorizedSigEmail: this.state.entityRepEmail,
                authorizedSigPhone: this.state.entityRepPhone,
                authorizedSigDialog: this.state.entityRepDialog,

            });

        }
        else {
            this.setState({
                authorizedSigName: '',
                authorizedSigEmail: '',
                authorizedSigPhone: '',
                authorizedSigDialog: '',
            });

        }
    }

    onValueChangeEntAdm(event) {
        this.setState({
            selectedEntAdmOption: event.target.value
        });
        if (event.target.value == 'yes') {
            this.setState({
                entityAdmName: this.state.entityRepName,
                entityAdmEmail: this.state.entityRepEmail,
                entityAdmPhone: this.state.entityRepPhone,
                entityAdmDialog: this.state.entityRepDialog
            });

        }
        else {
            this.setState({
                entityAdmName: '',
                entityAdmEmail: '',
                entityAdmPhone: '',
                entityAdmDialog: ''
            });
        }
    }

    changeEntityRepNameHandler = (event) => {
        this.setState({ entityRepName: event.target.value })

        if (this.state.selectedAutSigOption == 'yes') {

            this.setState({
                authorizedSigName: event.target.value
            });
        }
        if (this.state.selectedEntAdmOption == 'yes') {

            this.setState({
                entityAdmName: event.target.value
            });
        }
    }

    changeEntityRepEmailHandler = (event) => {
        this.setState({ entityRepEmail: event.target.value })

        if (this.state.selectedAutSigOption == 'yes') {
            this.setState({
                authorizedSigEmail: event.target.value
            });

        }
        if (this.state.selectedEntAdmOption == 'yes') {
            this.setState({
                entityAdmEmail: event.target.value
            });

        }
    }

    changeEntityRepPhoneHandler = (event) => {
        this.setState({ entityRepPhone: event.target.value })

        if (this.state.selectedAutSigOption == 'yes') {
            this.setState({
                authorizedSigPhone: event.target.value
            });

        }
        if (this.state.selectedEntAdmOption == 'yes') {
            this.setState({
                entityAdmPhone: event.target.value
            });
        }
    }

    changeAutSigNameHandler = (event) => {
        this.setState({ authorizedSigName: event.target.value })
    }

    changeAutSigEmailHandler = (event) => {
        this.setState({ authorizedSigEmail: event.target.value })
    }

    changeAutSigPhoneHandler = (event) => {
        this.setState({ authorizedSigPhone: event.target.value })
    }

    onChangeValue = (field) => (event) => {
        event.persist();
        this.setState((prevState) => ({
            ...prevState,
            [field]: event?.target?.value || event?.currentTarget?.value,
        }))
    }

    changeEntAdmNameHandler = (event) => {
        this.setState({ entityAdmName: event.target.value })
    }

    changeEntAdmEmailHandler = (event) => {
        this.setState({ entityAdmEmail: event.target.value })
    }

    changeEntAdmPhoneHandler = (event) => {
        let tryParse = isNaN(event.target.value);
        this.setState({ entityAdmPhone: event.target.value })
        if (event.target.value == "" || tryParse == true) {
            this.setState({ entityAdmPhoneErrors: true })
        }
        else {
            this.setState({ entityAdmPhoneErrors: false })
        }
    }

    handleClickActiveTab(currentTab) {
        this.setState({ activeTab: currentTab });
    }

    handleFileUpload = async (event) => {
        try{
            const data = new FormData();
            let file = event.target.files[0];
            if (file.size > config.MAX_FILE_SIZE_IN_BYTE) {
                const errorMessage = 'Upload file size should not exceed ' + config.MAX_FILE_SIZE_IN_BYTE / 1024 / 1024 + 'MB';
                this.setState({errorMessage});
                showToast('error', errorMessage);
                return;
            }

            if (!config.FILE_TYPE_ALLOWED.includes(file.type)) {
                const errorMessage = 'Only (' + config.FILE_TYPE_ALLOWED.join(' ') + ') are allowed. Please upload another file';
                this.setState({errorMessage});
                showToast('error', errorMessage);
                return;
            }

            data.append('file', event.target.files[0]);
            data.append('category', "entity-management/company-documents")
            data.append('uploaderRole', "user")
            const response = await EntitiesService.uploadDocuments(data);
            const responseData = response.data.data;
            if (response.data.status == "OK"){
                this.createNewRowData(responseData.fileName, responseData.guid);
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch (error){
            let errorMessage = error.message || 'Unexpected Error'
            if( error.response ){
                console.log(error.response)
                errorMessage = error.response.data?.message // => the response payload
            }
            this.setState({errorMessage});
            showToast('error', errorMessage);
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
        api.sizeColumnsToFit()
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

    // dropdownModuleRenderer = params => {
    //     return '<select id="entityType1" onChange={this.changeEntityTypeHandler}><option value="" disabled selected hidden>Select Entity Type</option><option value="Public Listed">Public Listed</option><option value="Private Limited">Private Limited</option></select>'
    // }

    deleteRowClicked = async (event) => {
        if (event.colDef.headerName == "Action") {
            try{
                const response = await EntitiesService.deleteDocuments(event.data.guid);
                const responseData = response.data.data;
                if ( response.data.status == "OK"){
                    let arr = [];
                    this.state.documentList.forEach(document => {
                        if (document.fileName != event.data.fileName) {
                            arr.push(document);
                        }
                    });
                    this.setState({ documentList: arr });
                    this.setState({ documentGrid: !this.state.documentGrid });
                }
                else{
                    throw new Error(response.data.message);
                }
            }
            catch (error){
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                showToast('error', errorMessage)
            }
            if (this.state.documentList.length == 0) {
                this.setState({ documentTitleErrors: false })
            }
        }
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.setState({ errorMessage: 'Validation error, please check your input' })
        showToast('error', 'Validation error, please check your input')
    }

    handleValidSubmit = async (e) => {
        this.setState({ ifSubmit: true })
        if (!this.state.documentTitleErrors) {
            try{
            e.preventDefault();
            let createRequest = {
                entityName: this.state.companyName,
                gstNo: this.state.gstNo,
                companyRegistrationNumber: this.state.companyRegistrationNumber,
                country: this.state.country,
                entityType: this.state.entityType,
                industryType: this.state.entityIndustry,
                gstApplicable: this.state.gstApplicable,
                buyer: this.state.buyer,
                supplier: this.state.supplier,
                developer: this.state.developer,
                documentsMetaDataList: this.state.documentList,
                remarks: this.state.remarks,
                entityRepresentativeList: [{
                    name: this.state.entityRepName,
                    email: this.state.entityRepEmail,
                    workNumber: this.state.entityRepPhone,
                    countryCode: this.state.entityRepDialog,
                    userRole: this.state.entityRepRole
                },
                {
                    name: this.state.authorizedSigName,
                    email: this.state.authorizedSigEmail,
                    workNumber: this.state.authorizedSigPhone,
                    countryCode: this.state.authorizedSigDialog,
                    userRole: this.state.authorizedSigRole
                },
                {
                    name: this.state.entityAdmName,
                    email: this.state.entityAdmEmail,
                    workNumber: this.state.entityAdmPhone,
                    countryCode: this.state.entityAdmDialog,
                    userRole: this.state.entityAdmRole
                },
                ]
            }
            // features assigned to company
            createRequest['features'] = Object.keys(this.state.assignedFeatures).filter(k => this.state.assignedFeatures[k]);
            await EntitiesService.createEntity(createRequest);
            this.setState({ successMessage: 'Entity Creation Successful', isDirty: false })
            showToast('success', 'Entity Creation Successful');
            this.redirectToList()
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || 'System error!'
            this.setState({errorMessage})
            showToast('error', errorMessage);
        }
        } else {
            this.setState({ errorMessage: 'Validation error, please check your input' })
            showToast('error', 'Validation error, please check your input')
        }
    }
    onValueChangeIsBuyer(event) {
        this.setState({
            buyer: !this.state.buyer
        });
    }
    onValueChangeIsSupplier(event) {
        this.setState({
            supplier: !this.state.supplier
        });
    }

    redirectToList() {
        this.props.history.push(URL_CONFIG.LIST_ENTITIES)
    }

    render() {
        const { country, selectedGSTOption, phone, phoneVal, documentList, rowUsers, FIList } = this.state;
        const { t, i18n } = this.props;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit}>
                    <Container fluid className={classes['custom-container']}>
                        <HeaderMain
                            title={t('Onboard New Entity')}
                            className="mb-3"
                        />
                        <Card>
                            <CardHeader tag="h6">
                                {t('Entity Roles')}
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
                                                    onChange={this.onValueChangeIsBuyer}
                                                    label="Buyer"
                                                ></CustomInput>
                                                <CustomInput
                                                    type="checkbox"
                                                    className={classes['custom-control']}
                                                    id="supplier" name="supplier" value={this.state.supplier}
                                                    checked={this.state.supplier}
                                                    onChange={this.onValueChangeIsSupplier}
                                                    inline
                                                    label="Supplier"
                                                ></CustomInput>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                            </CardBody>
                        </Card>
                        <Card className="mt-3">
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
                                        <FormGroup  className="label-required">
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
                                                label={`${t('Country of Origin')}`}
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
                                                {t('Tax-Registered Business')}
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
                                                    label={`${t('Tax Reg. No.')}`}
                                                    placeholder={t('EnterGSTRegistrationNumber')}
                                                    value={this.state.gstNo}
                                                    onChange={this.changeGSTRegistrationNoHandler}
                                                    validate={{
                                                        required: { value: true, errorMessage: t('GstRegistrationNumber') },
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
                        {/* START: Entity Representitive Contact Information */}
                        <Card className="mt-3">
                            <CardHeader tag="h6">
                                {t('EnterRepresentitiveContactInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="entityRepName"
                                                label={`${t('Name')}`}
                                                placeholder={t('EnterEntityRepName')}
                                                value={this.state.entityRepName}
                                                onChange={this.changeEntityRepNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterEntityRepName') },
                                                    minLength: { value: 2, errorMessage: t('EntityRepNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityRepNameValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="email"
                                                name="entityRepEmail"
                                                label={`${t('Email')}`}
                                                placeholder={t('EnterEntityRepEmail')}
                                                value={this.state.entityRepEmail}
                                                onChange={this.changeEntityRepEmailHandler}
                                                validate={{
                                                    email: { value: true, errorMessage: t('EntityRepEmailValidValidation') },
                                                    required: { value: true, errorMessage: t('EntityRepEmailValidValidation') },
                                                    minLength: { value: 2, errorMessage: t('EntityRepEmailLengthValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityRepEmailLengthValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>

                                        <FormGroup className="label-required">
                                            <Row>
                                                <Col lg={12} className="pr-0">
                                                    <label
                                                        htmlFor="workNumber"
                                                        className={classes.inputText1}
                                                    >
                                                        {t("Phone")}
                                                    </label>
                                                </Col>
                                                <Col lg={4} className="pr-0">
                                                    <AvField
                                                        type="select"
                                                        name="entityRepDialog"
                                                        validate={{
                                                            required: { value: true, errorMessage: t("DialCodeRequired") }
                                                        }}
                                                        value={this.state.entityRepDialog}
                                                        onChange={this.onChangeValue('entityRepDialog')}
                                                    >
                                                        <option value="" hidden defaultValue>{t("DialCode")}</option>
                                                        {DialCodes.dialCodes
                                                            .map((code) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={code.value}
                                                                    data-subtext={code.label}
                                                                >
                                                                    {this.state.entityRepDialog === code.value ? `+${code.value}` : `${code.label} (+${code.value})`}
                                                                </option>
                                                            ))}
                                                    </AvField>
                                                </Col>
                                                <Col lg={8} className="pl-1">
                                                    <FormGroup className="label-required">
                                                        <AvField
                                                            type="text"
                                                            name="entityRepPhone"
                                                            placeholder={t('EnterEntityRepPhone')}
                                                            value={this.state.entityRepPhone}
                                                            onChange={this.changeEntityRepPhoneHandler}
                                                            validate={{
                                                                number: { value: true, errorMessage: t('EntityRepPhoneValidValidation') },
                                                                required: { value: true, errorMessage: t('EntityRepPhoneValidValidation') },
                                                                minLength: { value: 2, errorMessage: t('EntityRepPhoneLengthValidation') },
                                                                maxLength: { value: 50, errorMessage: t('EntityRepPhoneLengthValidation') }
                                                            }}
                                                            required />
                                                    </FormGroup>
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </Col>
                                </Row>

                            </CardBody>
                        </Card>
                        {/* END: Entity Representitive Contact Information */}
                        {/* START: Authorized signatory contact */}
                        <Card className="mt-3">
                            <CardHeader tag="h6">
                                {t('AuthorizedSignatoryContactInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row>

                                    <FormGroup>
                                        <Col lg={12}>
                                            <div>
                                                <Label for="AutSigSame" inline>
                                                    {t('AuthorizedSignatoryIsEntityRep')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                </Label>
                                                <CustomInput
                                                    type="radio"
                                                    label={t('Yes')}
                                                    id="yesAutSig"
                                                    name="AutSigSame"
                                                    value="yes"
                                                    inline
                                                    className={classes['custom-control']}
                                                    onChange={this.onValueChangeAutSig}

                                                />
                                                <CustomInput
                                                    type="radio"
                                                    id="noAutSig"
                                                    name="AutSigSame"
                                                    label={t('No')}
                                                    value="no"
                                                    inline
                                                    className={classes['custom-control']}
                                                    onChange={this.onValueChangeAutSig}
                                                    defaultChecked
                                                />
                                            </div>
                                        </Col>
                                    </FormGroup>

                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="authorizedSigName"
                                                label={t('Name')}
                                                placeholder={t('EnterAuthorizedSignatoryName')}
                                                value={this.state.authorizedSigName}
                                                onChange={this.changeAutSigNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterAuthorizedSignatoryName') },
                                                    minLength: { value: 2, errorMessage: t('AutorizedSigNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('AutorizedSigNameValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="email"
                                                name="authorizedSigEmail"
                                                label={t('Email')}
                                                placeholder={t('EnterAuthorizedSignatoryEmail')}
                                                value={this.state.authorizedSigEmail}
                                                onChange={this.changeAutSigEmailHandler}
                                                validate={{
                                                    email: { value: true, errorMessage: t('AuthorizedSigEmailValidValidation') },
                                                    required: { value: true, errorMessage: t('AuthorizedSigEmailValidValidation') },
                                                    minLength: { value: 2, errorMessage: t('AuthorizedSigEmailLengthValidation') },
                                                    maxLength: { value: 250, errorMessage: t('AuthorizedSigEmailLengthValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <Row>
                                                <Col lg={12} className="pr-0">
                                                    <label
                                                        htmlFor="workNumber"
                                                        className={classes.inputText1}
                                                    >
                                                        {t("Phone")}
                                                    </label>
                                                </Col>
                                                <Col lg={4} className="pr-0">
                                                    <AvField
                                                        type="select"
                                                        name="authorizedSigDialog"
                                                        validate={{
                                                            required: { value: true, errorMessage: t("DialCodeRequired") }
                                                        }}
                                                        value={this.state.authorizedSigDialog}
                                                        onChange={this.onChangeValue('authorizedSigDialog')}
                                                    >
                                                        <option value="" hidden defaultValue>{t("DialCode")}</option>
                                                        {DialCodes.dialCodes
                                                            .map((code) => (
                                                                <option
                                                                    key={uuidv4()}
                                                                    value={code.value}
                                                                    data-subtext={code.label}
                                                                >
                                                                     {this.state.authorizedSigDialog === code.value ? `+${code.value}` : `${code.label} (+${code.value})`}
                                                                </option>
                                                            ))}
                                                    </AvField>
                                                </Col>
                                                <Col lg={8} className="pl-1">
                                                    <AvField
                                                        type="text"
                                                        name="authorizedSigPhone"
                                                        placeholder={t('EnterAuthorizedSignatoryPhone')}
                                                        value={this.state.authorizedSigPhone}
                                                        onChange={this.changeAutSigPhoneHandler}
                                                        validate={{
                                                            number: { value: true, errorMessage: t('AuthorizedSigPhoneValidValidation') },
                                                            required: { value: true, errorMessage: t('AuthorizedSigPhoneValidValidation') },
                                                            minLength: { value: 2, errorMessage: t('AuthorizedSigPhoneLengthValidation') },
                                                            maxLength: { value: 50, errorMessage: t('AuthorizedSigPhoneLengthValidation') }
                                                        }}
                                                        required />
                                                </Col>
                                            </Row>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        {/* END: Authorized signatory contact */}

                        {/* START: Entity Administrator Contact Information*/}
                        <Card className="mt-3">
                            <CardHeader tag="h6">
                                {t('EntityAdministratorContactInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row>

                                    <FormGroup>
                                        <Col lg={12}>
                                            <div>
                                                <Label for="EntAdmSame" inline>
                                                    {t('EntityAdministratorIsEntityRep')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                </Label>
                                                <CustomInput
                                                    type="radio"
                                                    label={t('Yes')}
                                                    id="yesEntAdm"
                                                    name="EntAdmSame"
                                                    value="yes"
                                                    className={classes['custom-control']}
                                                    inline
                                                    onChange={this.onValueChangeEntAdm}

                                                />
                                                <CustomInput
                                                    type="radio"
                                                    id="noEntAdm"
                                                    name="EntAdmSame"
                                                    className={classes['custom-control']}
                                                    label={t('No')}
                                                    value="no"
                                                    inline
                                                    onChange={this.onValueChangeEntAdm}
                                                    defaultChecked
                                                />
                                            </div>
                                        </Col>
                                    </FormGroup>

                                </Row>
                                <Row>
                                    <Col lg={4}>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="entAdminName"
                                                label={t('Name')}
                                                placeholder={t('EnterEntityAdminName')}
                                                value={this.state.entityAdmName}
                                                onChange={this.changeEntAdmNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterEntityAdminName') },
                                                    minLength: { value: 2, errorMessage: t('EntityAdmNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityAdmNameValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>

                                        <FormGroup className="label-required">
                                            <AvField
                                                type="email"
                                                name="entAdminEmail"
                                                label={t('Email')}
                                                placeholder={t('EnterEntityAdminEmail')}
                                                value={this.state.entityAdmEmail}
                                                onChange={this.changeEntAdmEmailHandler}
                                                validate={{
                                                    email: { value: true, errorMessage: t('EntityAdmEmailValidValidation') },
                                                    required: { value: true, errorMessage: t('EntityAdmEmailValidValidation') },
                                                    minLength: { value: 2, errorMessage: t('EntityAdmEmailLengthValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityAdmEmailLengthValidation') }
                                                }}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col lg={4}>

                                        <FormGroup className="label-required">
                                            <Row>
                                            <Col lg={12} className="pr-0">
                                                <label
                                                    htmlFor="workNumber"
                                                    className={classes.inputText1}
                                                >
                                                    {t("Phone")}
                                                </label>
                                            </Col>
                                            <Col lg={4} className="pr-0">
                                                <AvField
                                                    type="select"
                                                    name="entityAdmDialog"
                                                    value={this.state.entityAdmDialog}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("DialCodeRequired") }
                                                    }}
                                                    onChange={this.onChangeValue('entityAdmDialog')}
                                                >
                                                    <option value="" hidden defaultValue>{t("DialCode")}</option>
                                                    {DialCodes.dialCodes
                                                        .map((code) => (
                                                            <option
                                                                key={uuidv4()}
                                                                value={code.value}
                                                                data-subtext={code.label}
                                                            >
                                                                {this.state.entityAdmDialog === code.value ? `+${code.value}` : `${code.label} (+${code.value})`}

                                                            </option>
                                                        ))}
                                                </AvField>
                                            </Col>
                                            <Col lg={8} className="pl-1">
                                                <AvField
                                                    type="text"
                                                    name="entAdminPhone"
                                                    placeholder={t("EnterEntityAdminPhone")}
                                                    value={this.state.entityAdmPhone}
                                                    onChange={this.changeEntAdmPhoneHandler}
                                                    validate={{
                                                        required: { value: true, errorMessage: t("EnterValidWorkNumber") },
                                                        minLength: { value: 5, errorMessage: t("WorkNumberLengthValidation") },
                                                        maxLength: { value: 20, errorMessage: t("WorkNumberHasExceededMaxLength") },
                                                        pattern: { value: "^[^!@#$%^&*()][0-9-() ]+$", errorMessage: t("EnterValidWorkNumber") }
                                                    }}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                        </FormGroup>

                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        {/* END: Entity Administrator Contact Information*/}

                        <div>
                            <Nav tabs className={`${classes['navTabs']} mt-3`}>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 1 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 1)}>
                                        <i className="fa fa-fw fa-file-text mr-2" />
                                        <span className={classes['navTabs']}>Documents</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 2 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 2)}>
                                        <i className="fa fa-fw fa-check-square mr-2" />
                                        <span className={classes['navTabs']}>Module Subscription</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 3 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 3)}>
                                        <i className="fa fa-fw fa-pencil-square-o mr-2" />
                                        <span className={classes['navTabs']}>Remarks</span>
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            {this.state.activeTab == 1 &&
                            <Card>
                                <CardBody>
                                    {/* START: Upload documentation */}
                                    <CardBody>
                                            <Row>
                                                <Col lg>
                                                    <div>
                                                        <input
                                                            ref="fileInput"
                                                            onChange={this.handleFileUpload}
                                                            type="file"
                                                            style={{ display: "none" }}
                                                            // multiple={false}
                                                        />
                                                        <Button color="primary" className={`mb-2 mr-2 text-center`} onClick={() => this.refs.fileInput.click()}>
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
                                                            stopEditingWhenCellsLoseFocus
                                                            singleClickEdit
                                                            onGridReady={this.onGridReady}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    {/* END: Upload documentation */}
                                </CardBody>
                            </Card>
                            }

                            {this.state.activeTab == 2 &&
                            <Card>
                                <CardBody>
                                    {/* START: Module Subscription */}

                                    {/* TODO: populate real data */}
                                    {this.state.coreModules.map((module) =>
                                        <Row>
                                            <Col lg={12}>
                                                <Card>
                                                    <CardHeader tag="h6">
                                                        <div>
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
                                                        </div>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <Row>
                                                            {module.features.map((f) =>
                                                                <Col lg={4}>
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
                                    {/* END: Module Subscription */}
                                </CardBody>
                            </Card>
                            }
                            {this.state.activeTab == 3 &&
                            <Card>
                                <CardBody className={`${classes['cardBody']} mb-3`}>
                                    <Input
                                        type="textarea"
                                        name="remarks"
                                        placeholder={t('Enter remarks')}
                                        value={this.state.remarks}
                                        onChange={this.changeRemarks}
                                    />
                                </CardBody>
                            </Card>
                            }

                        </div>

                    </Container >
                    <StickyFooter>
                        <Row className="justify-content-between mx-0 px-3">
                            <Link to={URL_CONFIG.LIST_ENTITIES}>
                                <Button color="secondary" className={`mr-2`}>
                                    {t('Back')}
                                </Button>
                            </Link>
                            <Button type="submit" className={`mr-2`} color="primary">{t('Create')}</Button>
                        </Row>
                    </StickyFooter>
                </AvForm>
                <Prompt when={this.state.isDirty} message="Are you sure you want to leave this page as all your input will be lost?" />
            </React.Fragment >
        )
    }
}

const CreateEntity = withTranslation()(CreateEntity1);
export default CreateEntity;
