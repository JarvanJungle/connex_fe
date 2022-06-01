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
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import PAYMENT_BATCH_ROUTES from "../route";
import { PaymentBatchListColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const PaymentBatchList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [gridApi, setGridApi] = useState();
    const [paymentBatchList, setPaymentBatchList] = useState([]);

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setGridApi(params.api);
    };

    const initData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await PaymentBatchService.getPaymentBatchList(companyUuid);
            setPaymentBatchList(response.data.data);
            if (response.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onRowDoubleClicked = (params) => {
        history.push(
            `${PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_DETAILS}?uuid=${params?.data?.uuid}`
        );
    };

    useEffect(() => {
        const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (companyUuid && gridApi) {
            initData(companyUuid);
        }
    }, [permissionReducer, gridApi]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PaymentBatchList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <AgGridTable
                columnDefs={PaymentBatchListColDefs}
                onGridReady={onGridReady}
                rowData={paymentBatchList}
                gridHeight={580}
                onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                frameworkComponents={{
                    customTooltip: CustomTooltip
                }}
                colDef={defaultColDef}
            />
        </Container>
    );
};

export default PaymentBatchList;
