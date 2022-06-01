/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
// the hoc
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
    Container,
    Media,
    Button
} from 'components';
import {
    AgGridReact
} from 'components/agGrid';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './ListCompany.scss';
import { ToastContainer, toast } from 'react-toastify';

import URL_CONFIG from 'services/urlConfig'

import CompaniesService from 'services/CompaniesService'
import {convertToLocalTime} from "helper/utilities";

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
/*
    Custom Renderers
*/

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



class ListCompany1 extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            entities: [],
            entitiesData: [],
            entitiesDataTemp: [],
            quickFilterValue: '',
            defaultColDef: {
                editable: false,
                filter: 'agTextColumnFilter',
                floatingFilter: true,
                resizable: true,
            },
            columnDefs: [
                {
                    headerName: "Status",
                    field: "onboardingStatus",
                },
                {
                    headerName: "Company Name",
                    field: "entityName",
                },
                {
                    headerName: "Country of Origin",
                    field: "country"
                },
                {
                    headerName: "Company Registration No.",
                    field: "companyRegistrationNumber",
                    valueFormatter: ({value}) => value.toUpperCase()
                },
                {
                    headerName: "Is Active",
                    field: "active",
                    valueGetter: ({data}) => data.active ? "Yes" : "No",
                },
                {
                    headerName: "Main Company",
                    valueGetter: ({data}) => data.mainCompany ? "Yes" : "No",
                },
                {
                    headerName: "Registration On",
                    field: "createdAt",
                    sort: "desc",
                    valueFormatter: ({value}) => convertToLocalTime(value)
                },
                {
                    headerName: "Expiry On",
                    field: "subscriptionExpiry",
                    valueFormatter: ({value}) => convertToLocalTime(value)
                }
            ]
        };
        this.gridApi = null;

        this.onGridReady = this.onGridReady.bind(this);
        this.onModelUpdated = this.onModelUpdated.bind(this);
        this.onQuickFilterChange = this.onQuickFilterChange.bind(this);
        this.selectEntity = this.selectEntity.bind(this);
        this.retrieveEntities = this.retrieveEntities.bind(this)
    }
    state = {
        layouts: _.clone(LAYOUT)
    }
    componentDidMount() {
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

    retrieveEntities = async () => {
        try{
            const response = await CompaniesService.getCompanies();
            const responseData = response.data.data;
            if (response.data.status == "OK"){
                this.setState({ entities: responseData })
            }
            else{
                throw new Error(response.data.message)
            }
        }
        catch (error){
            console.error('message', error.message)
            const errorMessage = error.message || 'System error!'
            this.setState({errorMessage})
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

    onGridReady = ({ api }) => {
        // this.gridApi = params.api;
        // this.gridColumnApi = params.columnApi;
        api.sizeColumnsToFit();
        this.retrieveEntities();
    }

    onQuickFilterChange(e) {
        this.setState({ quickFilterValue: e.target.value });
    }

    _resetLayout = () => {
        this.setState({
            layouts: _.clone(LAYOUT)
        })
    }

    selectEntity(event){
        this.props.history.push(URL_CONFIG.COMPANY_DETAILS+event.data.uuid)
    }

    render() {
        const { t, i18n } = this.props;
        return (
            <React.Fragment>
                <Container fluid={true}>
                    <div className="d-flex mb-5">
                        <HeaderMain
                            title={t('List of Companies')}
                            className="mt-0"
                        />
                    </div>
                    <div className="ag-theme-custom-react" style={{ height: '500px' }}>
                        <AgGridReact
                            columnDefs={this.state.columnDefs}
                            defaultColDef={this.state.defaultColDef}
                            rowData={this.state.entities}
                            pagination={true}
                            paginationPageSize={10}
                            onGridReady={this.onGridReady}
                            onRowDoubleClicked={this.selectEntity}
                        />
                    </div>
                </Container>
            </React.Fragment>
        );
    }
}
const ListCompany = withTranslation()(ListCompany1);
export default ListCompany;
