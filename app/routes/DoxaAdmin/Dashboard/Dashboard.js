/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

// the hoc
import { withTranslation } from 'react-i18next';
import {
    Container,
    Row,
    FloatGrid as Grid,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
} from 'components';
import { HeaderMain } from "routes/components/HeaderMain";

import classes from './Dashboard.scss';

import _ from 'lodash'

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


class DashBoard1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            companyName:"ABC Company",
            companyRegistrationNumber:"UE132141",
            originCountry:"Singapore",
            entityType:"LIMITED LIABILITY COMPANY",
            industryType:"CONSTRUCTION",
            gstApplicable: true,
        };
    }

    componentDidMount() {

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

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <Container fluid={false} className={classes['custom-container']}>
                    <HeaderMain
                        title={t('EntityDetails')}
                        className="mb-3"
                    />
                    <div className="mb-6">
                        <Button color="danger" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`}>
                            Deactivate Account
                        </Button>
                        <Button color="secondary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`}>
                            Reset password
                        </Button>
                        <Button color="secondary" className={`${classes['inputTextButton']} mb-2 mr-2 px-3`}>
                            Reset 2FA
                        </Button>
                    </div>

                    <Card className="card-doxa card-doxa--primary">
                        <CardHeader tag="h6">
                            {t('CompanyInformation')}
                            <span className="card-doxa-header-number">
                                3
                            </span>
                        </CardHeader>
                        <CardBody>
                            <Row className={`${classes['rowClass']}`}>
                                <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Company Name </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.companyName} </span>
                                </Col>
                                <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Company Registration No. </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.companyRegistrationNumber} </span>
                                </Col>
                                <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Origin Country </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.originCountry} </span>
                                </Col>
                            </Row>
                            <Row className={`${classes['rowClass']}`}>
                            <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Entity Type </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.entityType} </span>
                                </Col>
                                <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Industry Type </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.industryType} </span>
                                </Col>
                                <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> GST Applicable </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.gstApplicable} </span>
                                </Col>
                            </Row>
                            <Row className={`${classes['rowClass']}`}>
                            <Col lg={2}>
                                <label className={`${classes['inputText1']}`}> Company Name </label>
                                </Col>
                                <Col lg={2}>
                                <span inline className={`${classes['inputText2']}`}> {this.state.companyName} </span>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Container>
            </React.Fragment>

        )
    }
}

const DashBoard = withTranslation()(DashBoard1);
export default DashBoard;
