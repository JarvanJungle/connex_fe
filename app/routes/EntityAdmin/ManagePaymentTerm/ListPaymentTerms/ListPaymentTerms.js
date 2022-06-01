import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import PaymentTermService from "services/PaymentTermService";
import useToast from "routes/hooks/useToast";
import { useTranslation } from "react-i18next";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "react-bootstrap";
import { HeaderMain } from "routes/components/HeaderMain";
import { AgGridReact } from "components/agGrid";
import { convertToLocalTime, defaultColDef } from "helper/utilities";
import URL_CONFIG from "services/urlConfig";
import _ from "lodash";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";

const ListPaymentTerms = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const [companyUuid, setCompanyUuid] = useState("");
    const [gridApi, setGridApi] = useState();
    const paymentTermPermission = usePermission(FEATURE.PAYMENT_TERM);
    const [paymentTerms, setPaymentTerms] = useState([]);
    const currentCompany = useCurrentCompany();

    const columnDefs = [
        {
            headerName: t("PaymentTerm"),
            field: "ptName"
        },
        {
            headerName: t("PaymentTermPayIn"),
            field: "ptDays",
            valueFormatter: (param) => `${param.value} days`
        },
        {
            headerName: t("PaymentTermRemarks"),
            field: "ptRemarks"
        },
        {
            headerName: t("UpdatedOn"),
            field: "updatedOn",
            sort: "desc",
            valueFormatter: ({ value }) => convertToLocalTime(value)
        },
        {
            headerName: t("UpdatedBy"),
            field: "updatedByName"
        }
    ];

    useEffect(() => {
        if (!_.isEmpty(currentCompany)) {
            setCompanyUuid(currentCompany.companyUuid);
        }
    }, [currentCompany]);

    const retrievePaymentTerms = async () => {
        try {
            if (companyUuid) {
                const response = await PaymentTermService.getAllPaymentTerms(companyUuid);
                console.log("response", response);
                if (response.data.status === "OK") {
                    setPaymentTerms(response.data.data);
                } else {
                    throw new Error(response.data.message);
                }
            }
        } catch (error) {
            showToast("error", error.response.data.message);
        }
    };

    useEffect(() => {
        retrievePaymentTerms();
    }, [companyUuid]);

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api);
    };

    const onRowDoubleClick = (event) => {
        // Redirect to payment term details page
        history.push(URL_CONFIG.PAYMENT_TERM_DETAILS + event.data.ptUuid);
    };

    return (
        <>
            <Container fluid>
                <Row className="mb-1">
                    <Col lg={12}>
                        <HeaderMain
                            title={t("ListOfPaymentTerms")}
                            className="mb-3 mb-lg-3"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex mb-2">
                            {paymentTermPermission.write && (
                                <ButtonToolbar className="ml-auto">
                                    <Link to={URL_CONFIG.CREATE_PAYMENT_TERM}>
                                        <Button color="primary" className="mb-2 mr-2 px-3">
                                            <i className="fa fa-plus" />
                                            {` ${t("Create New")}`}
                                        </Button>
                                    </Link>
                                </ButtonToolbar>
                            )}
                        </div>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={12}>
                        <div className="ag-theme-custom-react" style={{ height: "500px" }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={paymentTerms}
                                pagination
                                paginationPageSize={10}
                                onGridReady={onGridReady}
                                rowSelection="multiple"
                                rowMultiSelectWithClick
                                onRowDoubleClicked={onRowDoubleClick}
                                suppressRowClickSelection
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ListPaymentTerms;
