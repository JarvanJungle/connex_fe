import React from 'react';

import Countries from '/public/assets/Countries.jsx'

// the hoc
import { withTranslation } from 'react-i18next';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { toast } from 'react-toastify';
import {
    Container,
    Row,
    Nav,
    NavItem,
    NavLink,
    UncontrolledModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    Media,
    FormGroup,
    Col, Label
} from 'components';
import {
    AgGridReact
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './ViewEntityDetails.scss';

import EntitiesService from 'services/EntitiesService'
import UserDataService from 'services/UserService'
import { StickyFooter } from 'components/StickyFooter/StickyFooter';

import URL_CONFIG from 'services/urlConfig'
import PrivilegesService from 'services/PrivilegesService';
import UserService from 'services/UserService';
import CompaniesService from 'services/CompaniesService';
import DialCodes from "/public/assets/DialCodes";
import {v4 as uuidv4} from "uuid";
import useToast from "routes/hooks/useToast";
import {convertToLocalTime} from "helper/utilities";
import {Prompt} from "react-router-dom";

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

const showToast = useToast();

class ViewEntityDetails1 extends React.Component {
    constructor(props) {
        super(props);

        var today = new Date(),
            date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();

        this.state = {
            activeTab: 1,
            isEdit: false,
            errorMessage: '',
            coreModules: [],
            entityCompanies: [],
            mainCompany: {},
            assignedFeatures: {},
            moduleCheckedAll: {},
            entityRepRole: "Entity Representitive",
            authorizedSigRole: "Authorized Signatory",
            entityAdmRole: "Entity Administrator",
            uuid: '',
            companyName: "",
            companyRegistrationNumber: "",
            country: "",
            entityType: "",
            industryType: "",
            gstApplicable: false,
            buyer: false,
            supplier: false,
            developer: false,
            gstNo: "",
            entityRepName: "",
            entityRepEmail: "",
            entityRepDialog: '',
            entityRepPhone: "",
            authorizedSigDialog: '',
            authorizedSigName: "",
            authorizedSigEmail: "",
            authorizedSigPhone: "",
            entityAdmName: "",
            entityAdmDialog: '',
            entityAdmEmail: "",
            entityAdmPhone: "",
            documentList: [],
            documentListSend: [],
            sendDocumentList: [],
            successMessage: "",
            active: true,

            remarks: "",

            countryList: Countries.countries,
            entityTypeList: [],
            industryTypeList: [],

            defaultColDef: {
                editable: false,
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
                    width: 300,
                },
                {
                    headerName: this.props.t('FileName'),
                    field: "fileName",
                    width: 500,
                },
                {
                    headerName: this.props.t('CreatedDate'),
                    field: "createdAt",
                    sort: "desc",
                    width: 250,
                    valueFormatter: ({ value }) => convertToLocalTime(value)
                },
                {
                    headerName: this.props.t('FileLastUpdated'),
                    field: "updatedAt",
                    width: 250,
                    valueFormatter: ({ value }) => convertToLocalTime(value)
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "view",
                    cellRenderer: this.viewRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                }
            ],

            documentEditTableColDefs: [
                {
                    headerName: this.props.t('Title'),
                    field: "title",
                    editable: true,
                    width: 400,
                    cellStyle: () => ({
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    })
                },
                {
                    headerName: this.props.t('FileName'),
                    field: "fileName",
                    width: 500,

                },
                {
                    headerName: this.props.t('CreatedDate'),
                    field: "createdAt",
                    sort: "desc",
                    width: 250,
                    valueFormatter: ({ value }) => convertToLocalTime(value)

                },
                {
                    headerName: this.props.t('FileLastUpdated'),
                    field: "updatedAt",
                    width: 250,
                    valueFormatter: ({ value }) => convertToLocalTime(value)
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "delete",
                    cellRenderer: this.deleteRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                    width: 100,

                }
            ],

            defaultColDef1: {
                editable: false,
                filter: 'agTextColumnFilter',
                sizeColumnsToFit: true,
                autoSizeAllColumns: true,
                floatingFilter: true,
                resizable: true,
            },
            userTableColDefs: [
                {
                    headerName: "Full Name",
                    field: "name",
                },
                {
                    headerName: "Work Email",
                    field: "email",
                },
                {
                    headerName: "Work Phone",
                    valueGetter: ({ data }) => `${data.countryCode ? `+${data.countryCode} ` : ''}${data.workNumber}`,
                },
                {
                    headerName: "Designation",
                    field: "designation",
                },
                {
                    headerName: "Assigned Roles",
                    field: "roles",
                },
                {
                    headerName: "Companies",
                    valueGetter: ({ data }) => data?.companies?.map(e => e.companyName).join(", "),
                },
                {
                    headerName: "Is Active",
                    valueGetter: ({ data }) => data.active ? "Yes" : "No",
                },
            ],

            userList: [],

            defaultColDef2: {
                editable: false,
                filter: 'agTextColumnFilter',
                sizeColumnsToFit: true,
                autoSizeAllColumns: true,
                floatingFilter: true,
                resizable: true,
            },
            fiTableColDefs: [
                {
                    headerName: "Module Subscribed",
                    field: "moduleSubscribed",
                },
                {
                    headerName: "Bank",
                    field: "bank",
                },
                {
                    headerName: "Bank Account Number (where applicable)",
                    field: "bankAccountNumber",
                },
                {
                    headerName: "Bank Product Name",
                    field: "bankProductName",
                },
                {
                    headerName: "Status",
                    field: "status",
                },
                {
                    headerName: "Remarks",
                    field: "remarks",
                },
                {
                    headerName: "Supporting Doc",
                    field: "supportingDoc",
                },
                {
                    headerName: "Approve Connection",
                    field: "approveConnectionv",
                },
            ],

            FIList: [
                {
                    moduleSubscribed: "Payment Module",
                    bank: "UOB",
                    bankAccountNumber: "366123456",
                    bankProductName: "N/A",
                    status: "Connected",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
                {
                    moduleSubscribed: "Invoice Financing",
                    bank: "DBS",
                    bankAccountNumber: "N/A",
                    bankProductName: "Account Receivables Financing",
                    status: "In Progress",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
                {
                    moduleSubscribed: "Payment Module",
                    bank: "UOB",
                    bankAccountNumber: "N/A",
                    bankProductName: "Invoice Financing",
                    status: "Connected",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
                {
                    moduleSubscribed: "Payment Module",
                    bank: "UOB",
                    bankAccountNumber: "N/A",
                    bankProductName: "Trade Financing",
                    status: "In Progress",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
                {
                    moduleSubscribed: "Payment Module",
                    bank: "UOB",
                    bankAccountNumber: "60348656401",
                    bankProductName: "N/A",
                    status: "Connected",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
                {
                    moduleSubscribed: "Payment Module",
                    bank: "UOB",
                    bankAccountNumber: "366123456",
                    bankProductName: "ARP Financing",
                    status: "In Progress",
                    remarks: "",
                    supportingDoc: "",
                    approveConnection: ""
                },
            ],
        };
        this.retrieveFile = this.retrieveFile.bind(this);
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
        this.onChangeValue = this.onChangeValue.bind(this);
        this.changeAutSigNameHandler = this.changeAutSigNameHandler.bind(this);
        this.changeAutSigEmailHandler = this.changeAutSigEmailHandler.bind(this);
        this.changeAutSigPhoneHandler = this.changeAutSigPhoneHandler.bind(this);
        this.changeEntAdmNameHandler = this.changeEntAdmNameHandler.bind(this);
        this.changeEntAdmEmailHandler = this.changeEntAdmEmailHandler.bind(this);
        this.changeEntAdmPhoneHandler = this.changeEntAdmPhoneHandler.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this)
        this.handlePasswordReset = this.handlePasswordReset.bind(this)
        this.handle2FAReset = this.handle2FAReset.bind(this)
        this.handleDoNothing = this.handleDoNothing.bind(this)

        this.gridApi = null;

        this.onGridReady = this.onGridReady.bind(this);
        this.onModelUpdated = this.onModelUpdated.bind(this);
        this.onQuickFilterChange = this.onQuickFilterChange.bind(this);
        this.onCellValueChanged = this.onCellValueChanged.bind(this);
        this.deleteRowClicked = this.deleteRowClicked.bind(this);

        this.handleValidSubmit = this.handleValidSubmit.bind(this);
        this.handleInvalidSubmit = this.handleInvalidSubmit.bind(this);
        this.setEdit = this.setEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.retrieveEntityDetails = this.retrieveEntityDetails.bind(this);
        this.onRemarksChange = this.onRemarksChange.bind(this);
        this.handleAccountDeactivation = this.handleAccountDeactivation.bind(this);
        this.handleSelectedFeature = this.handleSelectedFeature.bind(this);

        this.onValueChangeIsBuyer = this.onValueChangeIsBuyer.bind(this);
        this.onValueChangeIsSupplier = this.onValueChangeIsSupplier.bind(this);
        this.onValueChangeIsDeveloper = this.onValueChangeIsDeveloper.bind(this);
    }

    handleClickActiveTab(currentTab) {
        this.setState({ activeTab: currentTab });
    }

    componentDidMount() {
        this.retrieveEntityDetails()
        this.retrieveEntityTypeList();
        this.retrieveIndustryTypeList();
        this.retrieveDoxaCoreModule();
        this.retrieveCompanySubscription();
        this.retrieveCompanyUserList();
    }

    handleSelectedFeature(featureCode, {features, moduleCode}) {
        this.setState((state) => {
            state.assignedFeatures[featureCode] = !state.assignedFeatures[featureCode];
            state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            return state;
        })

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

    retrieveDoxaCoreModule = async () => {
        try {
            const response = await PrivilegesService.getListAllFeatures();
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ coreModules: responseData })
                this.initCheckboxAll();
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    retrieveCompanySubscription = async () => {
        try {
            const companyUuid = this.state.mainCompany.uuid;
            const response = await PrivilegesService.getResourcesUnderCompany(companyUuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setCurrentSubscription(responseData);
                this.initCheckboxAll();
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
            // this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    listCompanies = async (entityUuid) => {
        try {
            const response = await CompaniesService.getCompaniesUnderEntity(entityUuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ entityCompanies: responseData });
                this.setMainCompany(responseData);
                this.retrieveCompanySubscription();
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
            // this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    setMainCompany(companies) {
        this.setState({ mainCompany: companies.find((e) => e.mainCompany) })
    }

    setCurrentSubscription(features) {
        for (const feature of features) {
            this.state.assignedFeatures[feature.featureCode] = true;
        }
    }

    retrieveEntityTypeList = async () => {
        try {
            const response = await EntitiesService.retrieveEntityType();
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ entityTypeList: responseData })
            }
            else {
                this.props.history.push(URL_CONFIG.LIST_ENTITIES)
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
        }
    }

    async retrieveCompanyUserList() {
        try {
            const query = new URLSearchParams(this.props.location.search);
            const uuid = query.get('uuid')
            const response = await EntitiesService.getUserListOfEntity(uuid);
            const responseData = response.data.data;
            this.setState((state) =>{
                state.userList = responseData;
                console.log(state);
                return state;
            })
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
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
                this.props.history.push(URL_CONFIG.LIST_ENTITIES)
                throw new Error(response.data.message)
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            showToast('error', errorMessage);
        }
    }

    retrieveEntityDetails = async () => {
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('uuid')
        try {
            const response = await EntitiesService.getEntity(token)
            const responseData = response.data.data
            if (response.data.status == "OK") {
                responseData.entityRepresentativeList.forEach(rep => {
                    if (rep.userRole === "Entity Representitive") {
                        this.setState({
                            entityRepName: rep.name,
                            entityRepEmail: rep.email,
                            entityRepPhone: rep.workNumber,
                            entityRepDialog: rep.countryCode,
                        })
                    }
                    else if (rep.userRole === "Authorized Signatory") {
                        this.setState({
                            authorizedSigName: rep.name,
                            authorizedSigEmail: rep.email,
                            authorizedSigPhone: rep.workNumber,
                            authorizedSigDialog: rep.countryCode,
                        })
                    }
                    else if (rep.userRole === "Entity Administrator") {
                        this.setState({
                            entityAdmName: rep.name,
                            entityAdmEmail: rep.email,
                            entityAdmPhone: rep.workNumber,
                            entityAdmDialog: rep.countryCode,
                        })
                    }
                })
                this.setState({
                    uuid: responseData.uuid,
                    companyName: responseData.entityName,
                    companyRegistrationNumber: responseData.companyRegistrationNumber,
                    country: responseData.country,
                    entityType: responseData.entityType,
                    industryType: responseData.industryType,
                    gstApplicable: responseData.gstApplicable,
                    gstNo: responseData.gstNo,
                    documentList: responseData.documentsMetaDataList,
                    active: responseData.active,
                    buyer: responseData.buyer,
                    supplier: responseData.supplier,
                    developer: responseData.developer,
                    remarks: responseData.remarks,
                })
                this.listCompanies(responseData.uuid);
            }
            else {
                throw new Error(response.data.message);
            }
        }
        catch (error) {
            console.log('message', error.message)
            const errorMessage = error.message || 'Error loading entity'
            this.setState({ errorMessage })
            showToast('error', errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    state = {
        layouts: _.clone(LAYOUT)
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

    initCheckboxAll() {
        this.setState(state => {
            this?.state?.coreModules?.forEach(({moduleCode, features}) => {
                state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            })
            return state;
        })

    }

    onGridReady({ api }) {
        this.gridApi = api;
    }

    onQuickFilterChange(e) {
        this.setState({ quickFilterValue: e.target.value });
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
        })
    }

    viewRenderer = params => {
        return '<span><i class="fa fa-download" style="font-size:15px;color:navy"></i>         View Document</span>'
    }

    state = {
        layouts: _.clone(LAYOUT)
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
        })
    }


    retrieveFile = async (event) => {
        if (event.colDef.headerName == "Action") {
            try {
                const response = await EntitiesService.downloadDocuments("entity-management/company-documents", event.data.guid);
                const responseData = response.data.data;
                if (response.data.status == "OK") {
                    window.open(responseData);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                showToast('error', errorMessage);

            }
        }
    }

    changeCompanyNameHandler = (event) => {
        this.setState({ companyName: event.target.value })

    }

    changeCompanyRegistrationNumberHandler = (event) => {
        this.setState({ companyRegistrationNumber: event.target.value })

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

    onRemarksChange = (event) => {
        this.setState({ remarks: event.target.value })
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
                authorizedSigPhone: this.state.entityRepPhone
            });

        }
        else {
            this.setState({
                authorizedSigName: '',
                authorizedSigEmail: '',
                authorizedSigPhone: ''
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
                entityAdmPhone: this.state.entityRepPhone
            });

        }
        else {
            this.setState({
                entityAdmName: '',
                entityAdmEmail: '',
                entityAdmPhone: ''
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

    onChangeValue = (field) => (event) => {
        event.persist();
        this.setState((prevState) => ({
            ...prevState,
            [field]: event?.target?.value || event?.currentTarget?.value,
        }))
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
    handleFileUpload = async (event) => {
        try {
            const data = new FormData();
            data.append('file', event.target.files[0]);
            data.append('category', "entity-management/company-documents")
            data.append('uploaderRole', "user")
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
            showToast('error', errorMessage);

        }
    }

    createNewRowData(fileName, guidResponse) {
        var today = new Date()
        var day = ''
        var month = ''
        if (today.getDate() < 10) {
            day = '0' + today.getDate()
        }
        else {
            day = today.getDate()
        }
        if (today.getMonth() + 1 < 10) {
            month = '0' + (today.getMonth() + 1)
        }
        else {
            month = today.getMonth() + 1
        }
        var date = day + '/' + month + '/' + today.getFullYear();
        let arr = this.state.documentList.slice();
        let newRow = {
            title: '',
            fileName: fileName,
            guid: guidResponse,
            createdAt: date,
            updatedAt: date
        }
        this.setState({
            documentTitleErrors: true,
        })
        arr.push(newRow)
        this.setState({ documentList: arr });
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
                    throw new Error(response.data.message);
                }
            }
            catch (error) {
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                showToast('error', errorMessage);

            }
            if (this.state.documentList.length == 0) {
                this.setState({ documentTitleErrors: false })
            }
        }
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.setState({ errorMessage: 'Validation error, please check your input' })
        showToast('error', 'Validation error, please check your input');

    }

    handleAccountDeactivation = async (e) => {
        try {
            const response = await EntitiesService.deactivateEntity(this.state.uuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ active: false })
                this.setState({ successMessage: 'Entity Deactivation Successful' })
                showToast('success', 'Entity Deactivation Successful');
            }
            else {
                throw new Error(response.data.message);
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'System error!'
            this.setState({ errorMessage })
            showToast('error', errorMessage);

        }
    }

    handleAccountReactivation = async (e) => {
        try {
            const response = await EntitiesService.reactivateEntity(this.state.uuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ active: true })
                this.setState({ successMessage: 'Entity Reactivation Successful' })
                showToast('success', 'Entity Reactivation Successful');
            }
            else {
                throw new Error(response.data.message);
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'System error!'
            this.setState({ errorMessage })
            showToast('error', errorMessage);

        }
    }

    handleValidSubmit = async (e) => {
        var newArr = [];
        this.state.documentList.forEach(document => {
            newArr.push({
                fileName: document.fileName,
                guid: document.guid,
                title: document.title
            })
        })
        this.setState({ documentListSend: newArr })
        this.setState({ ifSubmit: true })
        if (!this.state.documentTitleErrors) {
            try {
                e.preventDefault();
                let updateRequest = {
                    uuid: this.state.uuid,
                    entityName: this.state.companyName,
                    gstNo: this.state.gstNo,
                    companyRegistrationNumber: this.state.companyRegistrationNumber,
                    country: this.state.country,
                    entityType: this.state.entityType,
                    industryType: this.state.industryType,
                    gstApplicable: this.state.gstApplicable,
                    buyer: this.state.buyer,
                    supplier: this.state.supplier,
                    developer: this.state.developer,
                    documentsMetaDataList: this.state.documentListSend,
                    remarks: this.state.remarks,
                    entityRepresentativeList: [{
                        name: this.state.entityRepName,
                        email: this.state.entityRepEmail,
                        workNumber: this.state.entityRepPhone,
                        userRole: this.state.entityRepRole,
                        countryCode: this.state.entityRepDialog,
                    },
                    {
                        name: this.state.authorizedSigName,
                        email: this.state.authorizedSigEmail,
                        workNumber: this.state.authorizedSigPhone,
                        userRole: this.state.authorizedSigRole,
                        countryCode: this.state.authorizedSigDialog,
                    },
                    {
                        name: this.state.entityAdmName,
                        email: this.state.entityAdmEmail,
                        workNumber: this.state.entityAdmPhone,
                        userRole: this.state.entityAdmRole,
                        countryCode: this.state.entityAdmDialog,
                    },
                    ]
                }

                updateRequest['features'] = Object.keys(this.state.assignedFeatures).filter(k => this.state.assignedFeatures[k]);
                const response = await EntitiesService.updateEntity(updateRequest)
                showToast('success', 'Entity updated successfully');
                if (response.data.status == "OK") {
                    this.cancelEdit();
                }
                else {
                    throw new Error(response.data.message)
                }
            }
            catch (error) {
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                showToast('error', errorMessage);

            }
        } else {
            this.setState({ errorMessage: 'Validation error, please check your input' })
            showToast('error', 'Validation error, please check your input' );

        }
    }

    setEdit() {
        this.setState({ isEdit: true })
    }

    cancelEdit() {
        this.setState({ isEdit: false })
        this.retrieveEntityDetails()
    }

    handlePasswordReset() {
        console.log("Password Reset")
        UserDataService.getEntityAdminFromEntityUuid(this.state.uuid).then(response => {
            console.log("testing: " + response.data.data)
            this.setState({ successMessage: 'Password Reset Successful' })
            showToast('success', 'Password Reset Successful' );
        }).catch(e => {
            this.setState({ errorMessage: e.message })
            showToast('error', e?.response?.data.message || e?.message);

        })
    }

    handle2FAReset() {
        console.log("2FA Reset")
        UserDataService.getEntityAdminFromEntityUuid(this.state.uuid).then(response => {
            UserDataService.resetTwoFA({ uuid: response.data.data }).then((res) => {
                this.setState({ successMessage: 'Two FA Reset Successful' })
                showToast('success', 'Two FA Reset Successful');
            }).catch(e => {
                showToast('error', e?.response?.data.message || e?.message);

            })
        }).catch(e => {
            this.setState({ errorMessage: e.message })
            showToast('error', e?.response?.data.message || e?.message);

        })
    }

    handleDoNothing() { }

    onValueChangeIsBuyer(event) {
        this.setState({
            buyer: !this.state.buyer,
        });
    }
    onValueChangeIsSupplier(event) {
        this.setState({
            supplier: !this.state.supplier,
        });
    }
    onValueChangeIsDeveloper(event) {
        this.setState({
            supplier: !this.state.supplier,
        });
    }

    render() {
        const { country, selectedGSTOption, phone, phoneVal, documentList, rowUsers, FIList } = this.state;
        const { t, i18n } = this.props;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={this.handleValidSubmit} onInvalidSubmit={this.handleInvalidSubmit}>
                    <Container fluid={true} className={classes['custom-container']}>
                        <HeaderMain
                            title={t('EntityDetails')}
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
                                                    disabled={!this.state.isEdit}
                                                />
                                                <CustomInput
                                                    type="checkbox"
                                                    className={classes['custom-control']}
                                                    id="supplier" name="supplier" value={this.state.supplier}
                                                    checked={this.state.supplier}
                                                    onChange={this.onValueChangeIsSupplier}
                                                    inline
                                                    label="Supplier"
                                                    disabled={!this.state.isEdit}
                                                />
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
                                <Row className={`${classes['rowClass']}`}>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="companyName"
                                                label={t('CompanyName')}
                                                placeholder={t('EnterCompanyName')}
                                                className={`${classes['inputClass']}`}
                                                value={this.state.companyName}
                                                onChange={this.changeCompanyNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterCompanyName') },
                                                    minLength: { value: 2, errorMessage: t('CompanyNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('CompanyNameValidation') }
                                                }}
                                                required
                                                disabled
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="comRegNo"
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterCompanyRegistrationNumber')}
                                                value={this.state.companyRegistrationNumber}
                                                label={t('CompanyRegistrationNumber')}
                                                onChange={this.changeCompanyRegistrationNumberHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterCompanyRegistrationNumber') },
                                                    minLength: { value: 2, errorMessage: t('CompanyRegistrationNumberValidation') },
                                                    maxLength: { value: 50, errorMessage: t('CompanyRegistrationNumberValidation') }
                                                }}
                                                disabled
                                                required
                                            />
                                        </FormGroup>

                                    </Col>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="country"
                                                label={`${t('Country of Origin')}`}
                                                disabled
                                                className={`${classes['inputClass']}`}
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
                                </Row>
                                <Row className={`${classes['rowClass2']}`}>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="entityType1"
                                                label={t('EntityType')}
                                                disabled
                                                className={`${classes['inputClass']}`}
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

                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="select"
                                                name="entityIndustry1"
                                                label={t('IndustryType')}
                                                disabled
                                                className={`${classes['inputClass']}`}
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

                                    <Col>
                                        <FormGroup>
                                            <Label for="GST Applicable">
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
                                                  checked={this.state.gstApplicable}
                                                  disabled={!this.state.isEdit}
                                                />
                                                <CustomInput
                                                  type="radio"
                                                  className={classes['custom-control']}
                                                  id="noGST" name="gstApplicable" value="no"
                                                  onChange={this.onValueChangeGST}
                                                  inline
                                                  label="No"
                                                  checked={!this.state.gstApplicable}
                                                  disabled={!this.state.isEdit}
                                                />
                                            </div>
                                        </FormGroup>

                                    </Col>
                                </Row>
                                {this.state.gstApplicable &&
                                    <Row className={`${classes['rowClass3']}`}>
                                        <Col xs={4}>
                                            <FormGroup className="label-required">
                                                <AvField
                                                    label={`${t('Tax Reg. No.')}`}
                                                    type="text"
                                                    name="gstRegNo"
                                                    className={`${classes['inputClass']}`}
                                                    placeholder={t('EnterGSTRegistrationNumber')}
                                                    value={this.state.gstNo}
                                                    onChange={this.changeGSTRegistrationNoHandler}
                                                    validate={{
                                                        required: { value: true, errorMessage: t('GstRegistrationNumber') },
                                                        minLength: { value: 2, errorMessage: t('CompanyGstNumberValidation') },
                                                        maxLength: { value: 50, errorMessage: t('CompanyGstNumberValidation') }
                                                    }}
                                                    disabled={!this.state.isEdit}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                }
                            </CardBody>
                        </Card>
                        <Card className="mt-3">
                            <CardHeader>
                                {t('EnterRepresentitiveContactInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row className={`${classes['rowClass2']}`}>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="entityRepName"
                                                label={`${t('Name')}`}
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterEntityRepName')}
                                                value={this.state.entityRepName}
                                                onChange={this.changeEntityRepNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterEntityRepName') },
                                                    minLength: { value: 2, errorMessage: t('EntityRepNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityRepNameValidation') }
                                                }}
                                                disabled={!this.state.isEdit}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="email"
                                                name="entityRepEmail"
                                                className={`${classes['inputClass']}`}
                                                label={`${t('Email')}`}
                                                disabled={!this.state.isEdit}
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
                                    <Col>
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
                                                      disabled={!this.state.isEdit}
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
                                                          disabled={!this.state.isEdit}
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
                        <Card className="mt-3">
                            <CardHeader>
                                {t('AuthorizedSignatoryContactInformation')}
                            </CardHeader>
                            <CardBody>

                                <Row className={`${classes['rowClass2']}`}>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="authorizedSigName"
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterAuthorizedSignatoryName')}
                                                value={this.state.authorizedSigName}
                                                onChange={this.changeAutSigNameHandler}
                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterAuthorizedSignatoryName') },
                                                    minLength: { value: 2, errorMessage: t('AutorizedSigNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('AutorizedSigNameValidation') }
                                                }}
                                                label={t('Name')}
                                                disabled={!this.state.isEdit}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup className="label-required">
                                            <AvField
                                                type="email"
                                                name="authorizedSigEmail"
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterAuthorizedSignatoryEmail')}
                                                value={this.state.authorizedSigEmail}
                                                onChange={this.changeAutSigEmailHandler}
                                                validate={{
                                                    email: { value: true, errorMessage: t('AuthorizedSigEmailValidValidation') },
                                                    required: { value: true, errorMessage: t('AuthorizedSigEmailValidValidation') },
                                                    minLength: { value: 2, errorMessage: t('AuthorizedSigEmailLengthValidation') },
                                                    maxLength: { value: 250, errorMessage: t('AuthorizedSigEmailLengthValidation') }
                                                }}
                                                label={t('Email')}
                                                disabled={!this.state.isEdit}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col>
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
                                                      disabled={!this.state.isEdit}

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
                                                      disabled={!this.state.isEdit}

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
                        <Card className="mt-3">
                            <CardHeader>
                                {t('EntityAdministratorContactInformation')}
                            </CardHeader>
                            <CardBody>

                                <Row className={`${classes['rowClass2']}`}>
                                    <Col>

                                        <FormGroup className="label-required">
                                            <AvField
                                                type="text"
                                                name="entAdminName"
                                                require="entAdminName"
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterEntityAdminName')}
                                                value={this.state.entityAdmName}
                                                onChange={this.changeEntAdmNameHandler}
                                                disabled={!this.state.isEdit}

                                                validate={{
                                                    required: { value: true, errorMessage: t('EnterEntityAdminName') },
                                                    minLength: { value: 2, errorMessage: t('EntityAdmNameValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityAdmNameValidation') }
                                                }}
                                                label={t('Name')}
                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col>
                                        <FormGroup>
                                            <AvField
                                                type="email"
                                                name="entAdminEmail"
                                                className={`${classes['inputClass']}`}
                                                placeholder={t('EnterEntityAdminEmail')}
                                                value={this.state.entityAdmEmail}
                                                onChange={this.changeEntAdmEmailHandler}
                                                disabled={!this.state.isEdit}

                                                validate={{
                                                    email: { value: true, errorMessage: t('EntityAdmEmailValidValidation') },
                                                    required: { value: true, errorMessage: t('EntityAdmEmailValidValidation') },
                                                    minLength: { value: 2, errorMessage: t('EntityAdmEmailLengthValidation') },
                                                    maxLength: { value: 250, errorMessage: t('EntityAdmEmailLengthValidation') }
                                                }}
                                                label={t('Email')}

                                                required />
                                        </FormGroup>
                                    </Col>
                                    <Col>
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
                                                      disabled={!this.state.isEdit}

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
                                                      disabled={!this.state.isEdit}

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
                        <br />

                        <div>
                            <Nav tabs className={classes['navTabs']}>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 1 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 1)}>
                                        <i className="fa fa-fw fa-file-text mr-2"></i>
                                        <span className={classes['navTabs']}>Documents</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 2 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 2)} >
                                        <i className="fa fa-fw fa-user mr-2"></i>
                                        <span className={classes['navTabs']}>Users</span>
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className={this.state.activeTab === 3 ? "active" : ""} onClick={this.handleClickActiveTab.bind(this, 3)}>
                                        <i className="fa fa-fw fa-check-square mr-2"></i>
                                        <span className={classes['navTabs']}>Module Subscription</span>
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
                                        {this.state.isEdit === false &&
                                            <Row>
                                                <Col lg>
                                                    <div className="ag-theme-custom-react" style={{ height: '300px', width: '100%' }}>
                                                        <AgGridReact
                                                            columnDefs={this.state.documentTableColDefs}
                                                            defaultColDef={this.state.defaultColDef}
                                                            rowData={this.state.documentList}
                                                            onCellClicked={this.retrieveFile}
                                                            onModelUpdated={this.onModelUpdated}
                                                            suppressRowClickSelection={true}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        }
                                        {this.state.isEdit === true &&
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
                                        }

                                        {this.state.isEdit === true &&
                                            <Row>
                                                <Col lg>
                                                    <div className="ag-theme-custom-react" style={{ height: '300px', width: '100%' }}>
                                                        <AgGridReact
                                                            columnDefs={this.state.documentEditTableColDefs}
                                                            defaultColDef={this.state.defaultColDef}
                                                            rowData={this.state.documentList}
                                                            onCellValueChanged={this.onCellValueChanged}
                                                            onCellEditingStopped={this.onCellValueChanged}
                                                            onCellClicked={this.deleteRowClicked}
                                                            onModelUpdated={this.onModelUpdated}
                                                            suppressRowClickSelection
                                                            stopEditingWhenCellsLoseFocus
                                                            singleClickEdit
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        }
                                        <br />

                                    </CardBody>
                                </Card>
                            }
                            {/* Get All user under entity */}
                            {this.state.activeTab == 2 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>
                                                <div className="ag-theme-custom-react" style={{ height: '300px', width: '100%' }}>
                                                    <AgGridReact
                                                        columnDefs={this.state.userTableColDefs}
                                                        defaultColDef={this.state.defaultColDef1}
                                                        rowData={this.state.userList}
                                                        onModelUpdated={this.onModelUpdated}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                        <br />

                                    </CardBody>
                                </Card>
                            }

                            {this.state.activeTab == 3 &&
                                <Card className="mt-3">
                                    <CardBody>
                                        {/* TODO: populate real data */}
                                        {this.state.coreModules.map((module) =>
                                            <Row>
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
                                                              disabled={!this.state.isEdit}
                                                            />
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
                                                                        disabled={!this.state.isEdit}
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

                            {this.state.activeTab == 4 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>
                                                <div className="ag-theme-custom-react" style={{ height: '300px', width: '100%' }}>
                                                    <AgGridReact
                                                        columnDefs={this.state.fiTableColDefs}
                                                        defaultColDef={this.state.defaultColDef2}
                                                        rowData={this.state.FIList}
                                                        onModelUpdated={this.onModelUpdated}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                        <br />

                                    </CardBody>
                                </Card>
                            }

                            {this.state.activeTab == 5 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>
                                                <textarea placeholder={t("Enter remarks")} className={classes['textArea1']} value={this.state.remarks} onChange={this.onRemarksChange} disabled={!this.state.isEdit} />

                                            </Col>
                                        </Row>
                                        <br />
                                    </CardBody>
                                </Card>
                            }

                        </div>
                    </Container>
                    <StickyFooter >
                        <Row className="justify-content-between mx-0 px-3">
                            <div>
                                <Button
                                  color="secondary"
                                  className={`${classes['inputTextButton']} mb-2 mr-2 px-3`}
                                  onClick={() => this.state.isEdit ?
                                    this.cancelEdit() :
                                    this.props.history.goBack()
                                  }
                                >
                                    {t('Back')}
                                </Button>
                            </div>
                            <div>

                                {this.state.active === true &&
                                <Button color="secondary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} id="modal2" onClick={this.handleDoNothing}>
                                    Deactivate Account
                                </Button>
                                }
                                {this.state.active === true &&
                                <UncontrolledModal target="modal2" className="modal-outline-danger" onClick={this.handleDoNothing}>
                                    <ModalHeader tag="h6">
                                        <span className="text-danger">
                                            Account Deactivation
                                        </span>
                                    </ModalHeader>
                                    <ModalBody>
                                        Are you sure you want to deactivate the account?
                                    </ModalBody>
                                    <ModalFooter>
                                        <UncontrolledModal.Close color="link">
                                            Close
                                        </UncontrolledModal.Close>
                                        <UncontrolledModal.Close color="danger">
                                            <span onClick={this.handleAccountDeactivation}>{t("Deactivate")}</span>
                                        </UncontrolledModal.Close>
                                    </ModalFooter>
                                </UncontrolledModal>
                                }
                                {!this.state.active &&
                                <Button color="primary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} id="modal3" onClick={this.handleDoNothing}>
                                    Reactivate Account
                                </Button>
                                }
                                {!this.state.active &&
                                <UncontrolledModal target="modal3" className="modal-outline-success">
                                    <ModalHeader tag="h6">
                                        <span className="text-primary">
                                            Account Reactivation
                                        </span>
                                    </ModalHeader>
                                    <ModalBody>
                                        Are you sure you want to reactivate the account?
                                    </ModalBody>
                                    <ModalFooter>
                                        <UncontrolledModal.Close color="link">
                                            Close
                                        </UncontrolledModal.Close>
                                        <UncontrolledModal.Close color="primary">
                                            <span onClick={this.handleAccountReactivation}>{t("Reactivate")}</span>
                                        </UncontrolledModal.Close>
                                    </ModalFooter>
                                </UncontrolledModal>
                                }
                                <Button color="danger" id="modal" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} disabled={!this.state.active} onClick={this.handleDoNothing}>
                                    Reset 2FA
                                </Button>
                                <Button color="danger" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} disabled={!this.state.active} onClick={this.handlePasswordReset}>
                                    Reset Password
                                </Button>
                                <UncontrolledModal target="modal" className="modal-outline-warning">
                                    <ModalHeader tag="h6">
                                            <span className="text-warning">
                                                {t("Reset Two FA")}
                                            </span>
                                    </ModalHeader>
                                    <ModalBody>
                                        {t("Are you sure you want to reset user's two FA")}?
                                    </ModalBody>
                                    <ModalFooter>
                                        <UncontrolledModal.Close color="link" className="text-warning">
                                            <span>Close</span>
                                        </UncontrolledModal.Close>
                                        <UncontrolledModal.Close color="warning">
                                            <span onClick={this.handle2FAReset}>{t("Reset")}</span>
                                        </UncontrolledModal.Close>
                                    </ModalFooter>
                                </UncontrolledModal>
                                {this.state.isEdit === false &&
                                <>
                                    <Button color="facebook" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} onClick={this.setEdit} >
                                        Edit <i className="fa fa-pencil" />
                                    </Button>
                                </>
                                }
                                {this.state.isEdit === true &&
                                <Button color="primary" className={`${classes['inputTextButton']}  mb-2 mr-2 px-3`}>{t('Save')}</Button>
                                }
                            </div>
                        </Row>
                    </StickyFooter>
                </AvForm>
                <Prompt when={this.state.isEdit} message="Are you sure you want to leave this page as all your input will be lost?" />
            </React.Fragment >
        )
    }
}

const ViewEntityDetails = withTranslation()(ViewEntityDetails1);
export default ViewEntityDetails;
