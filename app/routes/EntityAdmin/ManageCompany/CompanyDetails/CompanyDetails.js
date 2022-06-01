/* eslint-disable react/no-string-refs */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import Countries from '/public/assets/Countries.jsx'

import URL_CONFIG from 'services/urlConfig'
var Instant = require('js-joda').Instant;
var LocalDate = require('js-joda').LocalDate;

// the hoc
import { withTranslation } from 'react-i18next';

import { AvForm, AvField } from 'availity-reactstrap-validation';

import EntitiesService from 'services/EntitiesService'
import UserDataService from 'services/UserService'
import PrivilegesService from 'services/PrivilegesService'

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
    FloatGrid as Grid,
    Button,
    CustomInput,
    Card,
    CardBody,
    CardHeader,
    Media,
    Col,
    FormGroup,
    Input
} from 'components';
import {
    AgGridReact,
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './CompanyDetails.scss';

import CompanyService from 'services/CompaniesService'
import { StickyFooter } from 'components/StickyFooter/StickyFooter';
import CompaniesService from 'services/CompaniesService';
import {convertToLocalTime, debounce} from "helper/utilities";
import useToast from "routes/hooks/useToast";
import CompanyLogo from './components/CompanyLogo';
import { FEATURE } from 'helper/constantsDefined';

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

const toast = useToast();

class CompanyDetails1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            isEdit: false,
            errorMessage: '',
            coreModules: [],
            assignedFeatures: {},
            entityCompanies: [],
            mainCompany: {},
            moduleCheckedAll: {},
            uuid: '',
            buyer: true,
            supplier: false,
            companyName: "",
            companyRegistrationNumber: "",
            country: "",
            entityType: "",
            industryType: "",
            gstApplicable: false,
            gstNo: "",
            documentList: [],
            documentListSend: [],
            isCompanyActive: true,
            successMessage: "",
            logoUrl: "",
            userDetails: null,

            remarks: "For testing only",

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
            handleRole: {
                load: false,
                read: false,
                write: false,
                approve: false
            },
            documentTableColDefs: [
                {
                    headerName: this.props.t('Title'),
                    field: "title",
                    width: 350
                },
                {
                    headerName: this.props.t('FileName'),
                    field: "fileName",
                    width: 350
                },
                {
                    headerName: this.props.t('FileDate'),
                    valueFormatter: ({ value }) => convertToLocalTime(value),
                    field: "createdAt",
                    width: 150
                },
                {
                    headerName: this.props.t('FileLastUpdated'),
                    valueFormatter: ({ value }) => convertToLocalTime(value),
                    field: "updatedAt",
                    width: 150
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "view",
                    cellRenderer: this.viewRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                    width: 100
                }
            ],

            documentEditTableColDefs: [
                {
                    headerName: this.props.t('Title'),
                    field: "title",
                    editable: true,
                    width: 350,
                    cellStyle: () => ({
                        backgroundColor: "#DDEBF7",
                        border: "1px solid #E4E7EB"
                    })
                },
                {
                    headerName: this.props.t('FileName'),
                    field: "fileName",
                    width: 350
                },
                {
                    headerName: this.props.t('FileDate'),
                    valueFormatter: ({ value }) => convertToLocalTime(value),
                    field: "createdAt",
                    width: 150
                },
                {
                    headerName: this.props.t('FileLastUpdated'),
                    valueFormatter: ({ value }) => convertToLocalTime(value),
                    field: "updatedAt",
                    width: 150
                },
                // {
                //     headerName: this.props.t('Action'),
                //     headerClass: 'text-center',
                //     field: "view",
                //     cellRenderer: this.viewRenderer,
                //     floatingFilter: false,
                //     cellStyle: { textAlign: 'center' },
                // }
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "delete",
                    cellRenderer: this.deleteRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                    width: 100
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
                    headerName: "Created On",
                    field: "createdAt",
                    sort: "desc",
                    valueFormatter: ({ value }) => convertToLocalTime(value)
                },
                {
                    headerName: "Status",
                    field: "active",
                    valueGetter: ({ data }) => data.active ? "Yes" : "No"
                }
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
            fiTableColDefsEdit: [
                {
                    headerName: "Module Subscribed",
                    field: "moduleSubscribed",
                    editable: true,
                },
                {
                    headerName: "Bank",
                    field: "bank",
                    editable: true,
                },
                {
                    headerName: "Bank Account Number (where applicable)",
                    field: "bankAccountNumber",
                    editable: true,
                },
                {
                    headerName: "Bank Product Name",
                    field: "bankProductName",
                    editable: true,
                },
                {
                    headerName: "Status",
                    field: "status",
                },
                {
                    headerName: "Remarks",
                    field: "remarks",
                    editable: true,
                },
                {
                    headerName: "Supporting Doc",
                    field: "supportingDoc",
                    editable: true,
                },
                {
                    headerName: "Approve Connection",
                    field: "approveConnectionv",
                    editable: true,
                },
                {
                    headerName: this.props.t('Action'),
                    headerClass: 'text-center',
                    field: "delete",
                    cellRenderer: this.deleteRenderer,
                    floatingFilter: false,
                    cellStyle: { textAlign: 'center' },
                    width: 100
                }
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
        this.setEdit = this.setEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
        this.retrieveCompanyDetails = this.retrieveCompanyDetails.bind(this);
        this.onRemarksChange = this.onRemarksChange.bind(this);
        this.handleAccountDeactivation = this.handleAccountDeactivation.bind(this);
        this.handleAccountReactivation = this.handleAccountReactivation.bind(this);
        this.retrieveEntityTypeList = this.retrieveEntityTypeList.bind(this);
        this.retrieveIndustryTypeList = this.retrieveIndustryTypeList.bind(this);
        this.retrieveCompanyUsers = this.retrieveCompanyUsers.bind(this);
        this.onBackButtonPressHandler = this.onBackButtonPressHandler.bind(this)
    }

    handleSelectedFeature(featureCode, { moduleCode, features }) {
        this.setState((state) => {
            state.assignedFeatures[featureCode] = !state.assignedFeatures[featureCode];
            state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            return state;
        })
    }

    setCurrentSubscription(features) {
        for (const feature of features) {
            this.state.assignedFeatures[feature.featureCode] = true;
        }
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
            toast("error", errorMessage);
            this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
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
                .filter((f) => f.featureCode === FEATURE.SUB_ENTITY)
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

    retrieveCompanySubscription = async () => {
        if (this.state.handleRole?.write) {
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
                toast("error", errorMessage);
                // this.props.history.push(URL_CONFIG.LIST_ENTITIES)
            }
        }
    }

    setMainCompany(companies) {
        this.setState({ mainCompany: { uuid: companies } })
    }

    listCompanies = async (entityUuid) => {
        try {
            const response = await CompaniesService.getCompaniesUnderEntity(entityUuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ entityCompanies: responseData });
                this.setMainCompany(entityUuid);
                this.retrieveCompanySubscription();
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'Error loading form'
            this.setState({ errorMessage });
            toast("error", errorMessage);
            // this.props.history.push(URL_CONFIG.LIST_ENTITIES)
        }
    }

    handleClickActiveTab(currentTab) {
        this.setState({ activeTab: currentTab });
    }

    componentDidMount() {
        this.getRole();
        this.retrieveCompanyDetails()
        this.retrieveEntityTypeList();
        this.retrieveIndustryTypeList();
        this.retrieveCompanyUsers();
        this.retrieveDoxaCoreModule();
    }

    onBackButtonPressHandler = () => {
        this.props.history.goBack();
    };

    retrieveCompanyUsers() {
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('uuid')
        UserDataService.getCompanyUsers(token).then(response => {
            this.setState({ userList: response.data.data })
        }).catch(error => {
            message = error.response.data.message
            toast("error", message);
        })
    }

    retrieveEntityTypeList = async () => {
        try {
            const response = await EntitiesService.retrieveEntityType();
            const responseData = response.data.data;
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

    retrieveCompanyDetails = async () => {
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('uuid')

        try {
            const response = await CompanyService.getCompany(token);
            const responseData = response.data.data
            if (response.data.status == "OK") {
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
                    isCompanyActive: responseData.active,
                    buyer: responseData.buyer,
                    supplier: responseData.supplier,
                    remarks: responseData.remarks,
                    logoUrl: responseData.logoUrl,
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
            toast("error", errorMessage);

            this.props.history.push(URL_CONFIG.LIST_COMPANIES)
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
        return '<span><i class="fa fa-download" style="font-size:15px;color:navy"></i></span>'
    }

    state = {
        layouts: _.clone(LAYOUT)
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
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
    changeUrl(url) {
        this.setState({ logoUrl: url });
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
                toast("error", errorMessage);
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
    initCheckboxAll() {
        this.setState(state => {
            this?.state?.coreModules?.forEach(({ moduleCode, features }) => {
                state.moduleCheckedAll[moduleCode] = features.every(feature => state.assignedFeatures[feature.featureCode]);
            })
            return state;
        })

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
    addNewFiConnection = async () => {
        let arr = [...this.state.FIList]
        arr.push({
            moduleSubscribed: "",
            bank: "",
            bankAccountNumber: "",
            bankProductName: "",
            status: "Connected",
            remarks: "",
            supportingDoc: "",
            approveConnection: ""
        })
        this.setState({ FIList: arr })
        this.setState({
            documentTitleErrors: true,
        })
    }
    deleteRowFiConnection = async (event) => {
        if (event.colDef.headerName == "Action") {
            try {
                let arr = [...this.state.FIList]
                arr.splice(event.index, 1)
                this.setState({ FIList: arr })
            }
            catch (error) {
                console.error('message', error.message);
                const errorMessage = error.message || 'System error!'
                this.setState({ errorMessage })
                toast("error", errorMessage);

            }
            if (this.state.FIList.length == 0) {
                this.setState({ documentTitleErrors: false })
            }
        }
    }

    handleAccountDeactivation = async (e) => {
        try {
            const response = await CompaniesService.deactivateCompany(this.state.uuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ isCompanyActive: false })
                this.setState({ successMessage: 'Company Deactivation Successful' })
                toast("success", "Company Deactivation Successful");
            }
            else {
                throw new Error(response.data.message);
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'System error!'
            this.setState({ errorMessage })
            toast("error", errorMessage);

        }
    }

    handleAccountReactivation = async (e) => {
        try {
            const response = await CompaniesService.reactivateCompany(this.state.uuid);
            const responseData = response.data.data;
            if (response.data.status == "OK") {
                this.setState({ isCompanyActive: true })
                this.setState({ successMessage: 'Company Reactivation Successful' })
                toast("success", 'Company Reactivation Successful')
            }
            else {
                throw new Error(response.data.message);
            }
        }
        catch (error) {
            console.error('message', error.message);
            const errorMessage = error.message || 'System error!'
            this.setState({ errorMessage })
            toast("error", errorMessage);

        }
    }

    handleInvalidSubmit = (e) => {
        this.setState({ ifSubmit: true })
        this.setState({ errorMessage: 'Validation error, please check your input' })
        toast("error", 'Validation error, please check your input');

    }

    getUsers = () => {
        UserDataService.getOwnUserDetails().then((response) => {
            if (response.data.status === "OK") {
                this.setState({ userDetails: response.data.data })
            } else {
                return null;
            }
        }).catch((error) => {
            return null;
        });
    };

    handleValidSubmit = async (e) => {
        if (this.state.buyer || this.state.supplier) {
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
                    let updateRequest = {
                        buyer: this.state.buyer,
                        supplier: this.state.supplier,
                        remarks: this.state.remarks,
                        uuid: this.state.uuid,
                        entityName: this.state.companyName,
                        gstNo: this.state.gstNo,
                        companyRegistrationNumber: this.state.companyRegistrationNumber,
                        country: this.state.country,
                        entityType: this.state.entityType,
                        industryType: this.state.industryType,
                        gstApplicable: this.state.gstApplicable,
                        documentsMetaDataList: this.state.documentListSend,
                        logoUrl: this.state.logoUrl,
                    }
                    updateRequest['features'] = Object.keys(this.state.assignedFeatures).filter(k => this.state.assignedFeatures[k]);
                    const response = await CompanyService.updateCompany(updateRequest)
                    const responseData = response.data.data;
                    if (response.data.status == "OK") {
                        this.setState({ successMessage: 'Update Successfully' })
                        toast("success", 'Update Successfully')
                        this.props.history.push(URL_CONFIG.COMPANY_DETAILS + this.state.uuid)
                        this.setState({ isEdit: false })
                        this.getUsers();
                    } else {
                        throw new Error(response.data.message)
                    }
                } catch (error) {
                    console.error('message', error.message);
                    const errorMessage = error.message || 'System error!'
                    this.setState({ errorMessage })
                    toast("error", errorMessage);

                }
            } else {
                this.setState({ errorMessage: 'Validation error, please check your input' })
                toast("error", 'Validation error, please check your input');

            }
        } else {
            this.setState({ ifSubmit: true })
            toast('error', 'Validation error, please choose at least one role');
        }
    }

    setEdit() {
        this.setState({ isEdit: true })
    }

    cancelEdit() {
        this.setState({ isEdit: false })
        this.retrieveCompanyDetails()
    }

    render() {
        const { country, selectedGSTOption, phone, phoneVal, documentList, rowUsers, FIList } = this.state;
        const { t, i18n } = this.props;
        return (
            <React.Fragment>
                <AvForm onValidSubmit={debounce(this.handleValidSubmit)} onInvalidSubmit={debounce(this.handleInvalidSubmit)}>
                    <Container fluid={true} className={classes['custom-container']}>
                        <HeaderMain
                            title={t('CompanyDetails')}
                            className="mb-3"
                        />
                        <Card>
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
                                                    disabled={!this.state.isEdit}
                                                />
                                                <CustomInput
                                                    type="checkbox"
                                                    className={classes['custom-control']}
                                                    id="supplier" name="supplier" value={this.state.supplier}
                                                    checked={this.state.supplier}
                                                    onChange={() => this.setState({ ...this.state, supplier: !this.state.supplier })}
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
                        <Card>
                            <CardHeader tag="h6">
                                {t('CompanyInformation')}
                            </CardHeader>
                            <CardBody>
                                <Row className={`${classes['rowClass']}`}>
                                    <Col>
                                        <Row >
                                            {this.state.isEdit === false &&
                                                <Col md={12} className="label-required">
                                                    <label className={`${classes['inputText1']}`}> {t('CompanyNameDetails')} </label>
                                                </Col>
                                            }
                                            {this.state.isEdit === true &&
                                                <Col md={12} className={`${classes['labelAlign']} label-required`}>
                                                    <label className={`${classes['inputText1']}`}> {t('CompanyNameDetails')} </label>
                                                </Col>
                                            }
                                            <Col md={12}>
                                                {
                                                    <span inline className={`${classes['inputText2']}`}> {this.state.companyName} </span>
                                                }
                                                {this.state.isEdit === true &&
                                                    <FormGroup hidden>
                                                        <AvField
                                                            type="text"
                                                            name="companyName"
                                                            placeholder={t('EnterCompanyName')}
                                                            className={`${classes['inputClass']}`}
                                                            value={this.state.companyName}
                                                            onChange={this.changeCompanyNameHandler}
                                                            validate={{
                                                                required: { value: true, errorMessage: t('EnterCompanyName') },
                                                                minLength: { value: 2, errorMessage: t('CompanyNameValidation') },
                                                                maxLength: { value: 250, errorMessage: t('CompanyNameValidation') }
                                                            }}
                                                            required />
                                                    </FormGroup>
                                                }

                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row>
                                            {this.state.isEdit === false &&
                                                <Col md={12} className="label-required">
                                                    <label className={`${classes['inputText1']}`}> {t('CompanyRegistrationNumberDetails')} </label>
                                                </Col>
                                            }
                                            {this.state.isEdit === true &&
                                                <Col md={12} className={`label-required ${classes['labelAlign']}`}>
                                                    <label className={`${classes['inputText1']}`}> {t('CompanyRegistrationNumberDetails')} </label>
                                                </Col>
                                            }
                                            <Col md={12}>
                                                {
                                                    <span inline className={`${classes['inputText2']}`} style={{ 'textTransform': 'uppercase' }}> {this.state.companyRegistrationNumber} </span>
                                                }
                                                {this.state.isEdit === true &&
                                                    <FormGroup hidden>
                                                        <AvField
                                                            type="text"
                                                            name="comRegNo"
                                                            className={`${classes['inputClass']}`}
                                                            style={{ 'textTransform': 'uppercase' }}
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
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row>
                                            {this.state.isEdit === false &&
                                                <Col md={12} className="label-required">
                                                    <label className={`${classes['inputText1']}`}> {t('OriginCountryDetails')} </label>
                                                </Col>
                                            }
                                            {this.state.isEdit === true &&
                                                <Col md={12} className={`${classes['labelAlign']} label-required`}>
                                                    <label className={`${classes['inputText1']}`}> {t('OriginCountryDetails')} </label>
                                                </Col>
                                            }
                                            <Col md={12}>
                                                {
                                                    < span inline className={`${classes['inputText2']}`}> {this.state.country} </span>
                                                }
                                                {this.state.isEdit === true &&
                                                    <FormGroup hidden>
                                                        <AvField
                                                            type="select"
                                                            name="country"
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
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row className={`${classes['rowClass2']}`}>
                                    <Col>
                                        <Row>
                                            {this.state.isEdit === false &&
                                                <Col md={12} className="label-required">
                                                    <label className={`${classes['inputText1']}`}> {t('EntityTypeDetails')} </label>
                                                </Col>
                                            }
                                            {this.state.isEdit === true &&
                                                <Col md={12} className={`${classes['labelAlign']} label-required`}>
                                                    <label className={`${classes['inputText1']}`}> {t('EntityTypeDetails')} </label>
                                                </Col>
                                            }
                                            <Col md={12}>
                                                {
                                                    <span inline className={`${classes['inputText2']}`}> {this.state.entityType} </span>
                                                }
                                                {this.state.isEdit === true &&
                                                    <FormGroup hidden>
                                                        <AvField
                                                            type="select"
                                                            name="entityType1"
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
                                                }
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col>
                                        <Row>
                                            {this.state.isEdit === false &&
                                                <Col md={12} className="label-required">
                                                    <label className={`${classes['inputText1']}`}> {t('IndustryTypeDetails')} </label>
                                                </Col>
                                            }
                                            {this.state.isEdit === true &&
                                                <Col md={12} className={`${classes['labelAlign']} label-required`}>
                                                    <label className={`${classes['inputText1']}`}> {t('IndustryTypeDetails')} </label>
                                                </Col>
                                            }
                                            <Col md={12}>
                                                {
                                                    <span inline className={`${classes['inputText2']}`}> {this.state.industryType} </span>
                                                }
                                                {this.state.isEdit === true &&
                                                    <FormGroup hidden>
                                                        <AvField
                                                            type="select"
                                                            name="entityIndustry1"
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
                                                }
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col>
                                        <Row>
                                            <Col md={12} className="label-required">
                                                <label className={`${classes['inputText1']}`}> {t('GSTApplicableDetails')} </label>
                                            </Col>
                                            <Col md={12}>
                                                {this.state.gstApplicable === true && this.state.isEdit === false &&
                                                    <div className="gstButtons">
                                                        <CustomInput
                                                            type="radio"
                                                            id="yesGST" name="gstApplicable" value="yes"
                                                            inline
                                                            className={classes['custom-control']}
                                                            label="Yes"
                                                            defaultChecked
                                                            disabled
                                                        ></CustomInput>
                                                        <CustomInput
                                                            type="radio"
                                                            className={classes['custom-control']}
                                                            id="noGST" name="gstApplicable" value="no"
                                                            inline
                                                            label="No"
                                                            disabled
                                                        ></CustomInput>
                                                    </div>
                                                }
                                                {this.state.gstApplicable === false && this.state.isEdit === false &&
                                                    <div className="gstButtons">
                                                        <CustomInput
                                                            type="radio"
                                                            id="yesGST" name="gstApplicable" value="yes"
                                                            inline
                                                            className={classes['custom-control']}
                                                            label="Yes"
                                                            disabled
                                                        ></CustomInput>
                                                        <CustomInput
                                                            type="radio"
                                                            className={classes['custom-control']}
                                                            id="noGST" name="gstApplicable" value="no"
                                                            inline
                                                            label="No"
                                                            defaultChecked
                                                            disabled
                                                        ></CustomInput>
                                                    </div>
                                                }

                                                {this.state.gstApplicable === true && this.state.isEdit === true &&
                                                    <div className="gstButtons">
                                                        <CustomInput
                                                            type="radio"
                                                            id="yesGST" name="gstApplicable" value="yes"
                                                            inline
                                                            className={classes['custom-control']}
                                                            onChange={this.onValueChangeGST}
                                                            label="Yes"
                                                            defaultChecked

                                                        ></CustomInput>
                                                        <CustomInput
                                                            type="radio"
                                                            className={classes['custom-control']}
                                                            id="noGST" name="gstApplicable" value="no"
                                                            onChange={this.onValueChangeGST}
                                                            inline
                                                            label="No"

                                                        ></CustomInput>
                                                    </div>
                                                }
                                                {this.state.gstApplicable === false && this.state.isEdit === true &&
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
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                {this.state.gstApplicable === true &&
                                    <Row className={`${classes['rowClass3']}`}>
                                        <Col>
                                            <Row>
                                                {this.state.isEdit === false &&
                                                    <Col md={12} className="label-required">
                                                        <label className={`${classes['inputText1']}`}> {t('GstRegistrationNumberDetails')} </label>
                                                    </Col>
                                                }
                                                {this.state.isEdit === true &&
                                                    <Col md={12} className={`${classes['labelAlign']} label-required`}>
                                                        <label className={`${classes['inputText1']}`}> {t('GstRegistrationNumberDetails')} </label>
                                                    </Col>
                                                }
                                                <Col md={12}>
                                                    {this.state.isEdit === false &&
                                                        <span inline className={`${classes['inputText2']}`}> {this.state.gstNo} </span>
                                                    }
                                                    {this.state.isEdit === true &&
                                                        <FormGroup>
                                                            <AvField
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
                                                                required />
                                                        </FormGroup>
                                                    }
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <Row>
                                            </Row>
                                        </Col>
                                    </Row>
                                }
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
                                                            onGridReady={({ api }) => api.sizeColumnsToFit()}
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
                                                        <Button color="primary" className={`${classes['inputTextButton']} mb-2 mr-2`} onClick={() => this.refs.fileInput.click()}>
                                                            <i className="fa fa-plus" style={{ marginLeft: "8px" }} /> {t('Add')}
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
                                                            onGridReady={({ api }) => api.sizeColumnsToFit()}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        }
                                        <br />

                                    </CardBody>
                                </Card>
                            }
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
                                                        onGridReady={({ api }) => api.sizeColumnsToFit()}
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
                                        {this.state.coreModules.map((module, index) =>
                                            <Row key={index}>
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
                                                                {module.features.map((f, index) =>
                                                                    <Col key={index} lg={4}>
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

                            {this.state.activeTab == 5 &&
                                <Card className={`classes['navCard']`}>
                                    <CardBody className={classes['cardBody']}>
                                        <Row>
                                            <Col lg>

                                                <Input disabled={!this.state.isEdit} value={this.state.remarks}
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
                                        <Row>
                                            <Col lg>
                                                <CompanyLogo sendUrl={(url) => this.changeUrl(url)} logoUrl={this.state.logoUrl} isEdit={this.state.isEdit} userDetails={this.state.userDetails} />
                                            </Col>
                                        </Row>
                                        <br />
                                    </CardBody>
                                </Card>
                            }
                        </div>
                    </Container>
                    <StickyFooter>
                        <Row className="justify-content-between mx-0 px-3">
                            <Col className="d-flex justify-content-start">
                                {this.state.isEdit === false &&
                                    <Button
                                        type="button"
                                        color="secondary"
                                        className="mb-2 mr-2 px-3"
                                        onClick={this.onBackButtonPressHandler}
                                    >
                                        {t("Back")}
                                    </Button>
                                }
                                {this.state.isEdit === true &&
                                    <Button type="button" onClick={this.cancelEdit} color="secondary" className={`${classes['inputTextButton']}  mb-2 mr-2 px-3`}>
                                        {t('Back')}
                                    </Button>
                                }
                            </Col>
                            <Col className="d-flex justify-content-end">

                                {(this.state.isCompanyActive === true && this.state.handleRole?.write) &&
                                    <Button type="button" color="secondary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} id="modal2" onClick={this.handleDoNothing}>
                                        Deactivate Company
                                    </Button>
                                }
                                {(this.state.isCompanyActive === true && this.state.handleRole?.write) &&
                                    <UncontrolledModal target="modal2" className="modal-outline-danger" onClick={this.handleDoNothing}>
                                        <ModalHeader tag="h6">
                                            <span className="text-danger">
                                                Company Deactivation
                                            </span>
                                        </ModalHeader>
                                        <ModalBody>
                                            Are you sure you want to deactivate this company?
                                        </ModalBody>
                                        <ModalFooter>
                                            <UncontrolledModal.Close color="link">
                                                Close
                                            </UncontrolledModal.Close>
                                            <span onClick={this.handleAccountDeactivation}>
                                                <UncontrolledModal.Close color="danger">
                                                    {t("Deactivate")}
                                                </UncontrolledModal.Close>
                                            </span>
                                        </ModalFooter>
                                    </UncontrolledModal>
                                }
                                {(!this.state.isCompanyActive && this.state.handleRole?.write) &&
                                    <Button type="button" color="primary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`} id="modal3" onClick={this.handleDoNothing}>
                                        Reactivate Company
                                    </Button>
                                }
                                {(!this.state.isCompanyActive && this.state.handleRole?.write) &&
                                    <UncontrolledModal target="modal3" className="modal-outline-success">
                                        <ModalHeader tag="h6">
                                            <span className="text-primary">
                                                Company Reactivation
                                            </span>
                                        </ModalHeader>
                                        <ModalBody>
                                            Are you sure you want to reactivate this company?
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
                                {(this.state.isEdit === false && this.state.handleRole?.write) &&
                                    <Button type="button" color="secondary" className={`${classes['inputTextButton']} btn-facebook mb-2 mr-2 px-3`} onClick={this.setEdit} >
                                        Edit <i className="fa fa-pencil ml-1" />
                                    </Button>
                                }
                                {(this.state.isEdit === true && this.state.handleRole?.write) &&
                                    <Button color="primary" className={`mb-2 mr-2 px-3`}>{t('Save')}</Button>
                                }
                            </Col>
                        </Row>
                    </StickyFooter>
                </AvForm>
            </React.Fragment>
        )
    }

}

const CompanyDetails = withTranslation()(CompanyDetails1);
export default CompanyDetails;
