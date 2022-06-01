import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { Col, Container, Row } from "components";
import { useHistory } from "react-router-dom";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { useCurrentCompany } from "routes/hooks";
import { DeliveryOrderListColDefs } from "../ColumnDefs";
import DO_ROUTES from "../route";

const DeliveryOrderList = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const currentCompany = useCurrentCompany();
    const [doListState, setDOListState] = useState({
        loading: false,
        gridApi: null,
        doList: []
    });

    const getData = async () => {
        const { gridApi } = doListState;
        gridApi.showLoadingOverlay();
        try {
            const { companyUuid } = currentCompany;

            const response = await DeliveryOrderService.getListDeliveryOrder(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                setDOListState((prevStates) => ({
                    ...prevStates,
                    // fake data doList
                    doList: response.data.data
                }));

                if (response.data.data.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setDOListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        if (!_.isEmpty(currentCompany) && doListState.gridApi) {
            getData();
        }
    }, [currentCompany, doListState.gridApi]);

    const onRowDoubleClicked = (params) => {
        history.push(
            `${DO_ROUTES.DELIVERY_ORDER_DETAILS}?uuid=${params.data.doUuid}`
        );
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Delivery Orders List")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <AgGridTable
                columnDefs={DeliveryOrderListColDefs}
                onGridReady={onGridReady}
                rowData={doListState.doList}
                gridHeight={580}
                onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
            />
        </Container>
    );
};

export default DeliveryOrderList;
