import React from 'react';
import { Link } from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
var Instant = require('js-joda').Instant;
var LocalDate = require('js-joda').LocalDate;
import {
    Container,
    ButtonToolbar,
    ButtonGroup,
    Button,
    Row,
    Col,
} from 'components';
import {
    AgGridReact
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import { toast } from 'react-toastify';
import UserService from 'services/UserService'
import { convertToLocalTime } from "helper/utilities";
import { AgGridTable } from "../../components";
import PrivilegesService from 'services/PrivilegesService';
import { FEATURE } from 'helper/constantsDefined';

// const UserDetailsURL = '/users/details?uuid='

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

class ListEntityUsers1 extends React.Component {
    constructor(props) {
        super(props)
        this.pathRoutes = props.history.location.pathname;
        this.gridApi = null;
        this.onGridReady = this.onGridReady.bind(this);
        this.onModelUpdated = this.onModelUpdated.bind(this);
        this.onQuickFilterChange = this.onQuickFilterChange.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.retrieveUsers = this.retrieveUsers.bind(this);
        this.setUserRetrieveFromDB = this.setUserRetrieveFromDB.bind(this)
        this.handleExport = this.handleExport.bind(this);
    }

    state = {
        createLink: "",
        userDetailsURL: "",
        users: [],
        errorMessage: '',
        quickFilterValue: '',
        defaultColDef: {
            editable: false,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            resizable: true,
        },
        layouts: _.clone(LAYOUT),
        handleRole: {
            load: false,
            read: false,
            write: false,
            approve: false
        }
    };

    setUserRetrieveFromDB = (res) => {
        let users = []
        let number = 1;
        //add the numbering to each of the row data
        for (let i = 0; i < res.data.data.length; i++) {
            const isActive = res.data.data[i].active ? "Yes" : "No";
            let user = {
                number: number,
                name: res.data.data[i].name,
                email: res.data.data[i].email,
                uuid: res.data.data[i].uuid,
                countryCode: res.data.data[i].countryCode,
                workNumber: res.data.data[i].workNumber,
                status: isActive,
                designation: res.data.data[i].designation,
                createdAt: res.data.data[i].createdAt
            }
            users.push(user)
            number += 1
        }
        this.setState({ users: users })
    }

    retrieveUsers() {
        if (this.pathRoutes.includes("organization")) {
            this.setState({ createLink: "/organization/users/create" });
            this.setState({ userDetailsURL: "/organization/users/details?uuid=" });
            UserService.getEntityUsers().then((response) => {
                if (response.data.status === "OK") {
                    this.setUserRetrieveFromDB(response);
                } else {
                    const errorMessage = response.data.message || 'Error loading users'
                    this.setState({ errorMessage });
                    __showToast('error')
                }
            })
        }
        if (this.pathRoutes.includes("company")) {
            this.setState({ createLink: "/company-users/create" });
            this.setState({ userDetailsURL: "/company-users/details?uuid=" });
            let companyRole = JSON.parse(localStorage.getItem("companyRole"))
            UserService.getCompanyUsers(companyRole.companyUuid).then((response) => {
                if (response.data.status === "OK") {
                    this.setUserRetrieveFromDB(response);
                } else {
                    const errorMessage = response.data.message || 'Error loading users'
                    this.setState({ errorMessage });
                    __showToast('error')
                }
            })
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
            if (this.pathRoutes.includes("organization")) {
                const filteredPermissions = data
                    .filter((f) => f.featureCode === FEATURE.ORGANIZATION_USER)
                    .map((f) => f.actions);
                const handleRole = {
                    read: filteredPermissions.some((p) => p?.read),
                    write: filteredPermissions.some((p) => p?.write),
                    approve: filteredPermissions.some((p) => p?.approve)
                };
                this.setState({handleRole})
            }
            if (this.pathRoutes.includes("company")) {
                const filteredPermissions = data
                    .filter((f) => f.featureCode === FEATURE.COMPANY_USER)
                    .map((f) => f.actions);
                const handleRole = {
                    read: filteredPermissions.some((p) => p?.read),
                    write: filteredPermissions.some((p) => p?.write),
                    approve: filteredPermissions.some((p) => p?.approve)
                };
                this.setState({handleRole})
            }
        } catch (err) {
            console.log(err);
        }
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

    componentDidUpdate(prevProps, prevState) {
        if (this.gridApi) {
            if (this.state.quickFilterValue !== prevState.quickFilterValue) {
                this.gridApi.setQuickFilter(this.state.quickFilterValue);
            }
        }
    }

    componentDidMount() {
        this.getRole();
    }

    onModelUpdated() {
        if (this.gridApi) {
            const model = this.gridApi.getModel();
            const visibleCount = model.getRowCount();
            this.setState({ visibleCount });
        }
    }

    onGridReady = (params) => {
        //set auto width sizing for the columns
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        params.api.sizeColumnsToFit();
        //retrieve User
        this.retrieveUsers();
    }

    onQuickFilterChange(e) {
        this.setState({ quickFilterValue: e.target.value });
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
        })
    }

    selectUser(event) {
        this.props.history.push(this.state.userDetailsURL + event.data.uuid)
    }

    handleExport() {
        this.gridApi.exportDataAsCsv({ fileName: "user_list" });
    }

    render() {
        const { t, i18n } = this.props;

        const columnDefs = [
            {
                headerName: this.props.t("Full Name"),
                field: "name",
            },

            {
                headerName: this.props.t("Info Email"),
                field: "email",
            },
            {
                headerName: this.props.t("Work Phone"),
                field: "workNumber",
                valueGetter: ({ data }) => (data.countryCode ? `+${data.countryCode}` : '') + ` ${data.workNumber}`,
            },
            {
                headerName: this.props.t("Designation"),
                field: "designation",
            },
            {
                headerName: this.props.t("IsActive"),
                field: "status",
            },
            {
                headerName: this.props.t("CreatedOn"),
                field: "createdAt",
                sortable: true,
                sort: "desc",
                valueFormatter: ({ value }) => convertToLocalTime(value),
            },
        ]
        return (
            <React.Fragment>
                <Container fluid>
                    <Row className="mb-1">
                        <Col lg={12}>
                            {this.pathRoutes === "/company/users" ? (
                                <HeaderMain
                                    title={t(`Company Users List`)}
                                    className="mt-0"
                                />
                            ) : (
                                <HeaderMain
                                    title={t(`Organization Users List`)}
                                    className="mt-0"
                                />
                            )
                            }
                        </Col>
                        <Col lg={12}>
                            <div className="d-flex">

                                <ButtonToolbar className="ml-auto">
                                    <ButtonGroup className="align-self-start" >
                                        <Button color="secondary" className="mb-2 mr-2 px-3 float-right" onClick={this.handleExport}>
                                            <i className="fa fa-download mr-2" />
                                            {t('Download')}
                                        </Button>
                                    </ButtonGroup>
                                    {this.state.handleRole?.write && (
                                        <ButtonGroup className="align-self-start" >
                                            <Link to={this.state.createLink}>
                                                <Button color="primary" className="mb-2 mr-2 px-3">
                                                    <i className="fa fa-plus mr-2" />
                                                    <span>{t("CreateNew")}</span>
                                                </Button>
                                            </Link>
                                        </ButtonGroup>
                                    )}

                                </ButtonToolbar>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col lg={12}>
                            <div className="ag-theme-custom-react" style={{ height: '500px' }}>
                                <AgGridTable
                                    headerHeight={44}
                                    floatingFiltersHeight={44}
                                    columnDefs={columnDefs}
                                    defaultColDef={this.state.defaultColDef}
                                    rowData={this.state.users}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    onRowDoubleClicked={this.selectUser}
                                    autoSizeColumn={false}
                                />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}
const ListEntityUsers = withTranslation()(ListEntityUsers1);
export default ListEntityUsers;
