import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import {
    Col, Container, Row
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import PaymentService from "services/PaymentService/PaymentService";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";
import { useLocation } from "react-router";
import PAYMENT_ROUTE from "../route";
import PaymentListColDefs from "../ColumnDefs/PaymentListColDefs";

const PaymentList = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [listState, setListState] = useState({
        loading: false,
        gridApi: null,
        paymentList: []
    });

    const getData = async (currentCompanyUUID) => {
        const { gridApi } = listState;
        gridApi.showLoadingOverlay();
        try {
            const res = await PaymentService.getPaymentList(currentCompanyUUID);
            let listData = res?.data?.data;
            // Query params filter
            const query = new URLSearchParams(location.search);
            if (query.get("status")) {
                listData = listData.filter((item) => query?.get("status")?.split(",")?.includes(item.status) ?? true);
            }
            setListState((prevStates) => ({
                ...prevStates,
                // fake data
                paymentList: listData
            }));

            if (listData.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        params.api.showLoadingOverlay();
        setListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID) && listState.gridApi) {
            getData(currentCompanyUUID);
        }
    }, [permissionReducer, listState.gridApi]);

    const onRowDoubleClicked = (params) => {
        history.push(
            `${PAYMENT_ROUTE.PAYMENT_DETAILS}?uuid=${params?.data?.uuid}`
        );
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Payment List")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <AgGridTable
                columnDefs={PaymentListColDefs}
                onGridReady={onGridReady}
                rowData={listState.paymentList}
                gridHeight={580}
                onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
            />
        </Container>
    );
};

export default PaymentList;
