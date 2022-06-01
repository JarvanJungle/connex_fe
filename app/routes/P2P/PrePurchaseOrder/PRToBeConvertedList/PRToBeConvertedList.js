import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import _ from "lodash";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import { useCurrentCompany } from "routes/hooks";
import { PRToBeConvertedListColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip",
    sortable: true
};

const PRToBeConvertedList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [prListState, setPRListState] = useState({
        loading: false,
        gridApi: null,
        prList: []
    });
    const currentCompany = useCurrentCompany();

    const getData = async () => {
        const { gridApi } = prListState;
        gridApi.showLoadingOverlay();
        try {
            const { companyUuid } = currentCompany;

            const response = await PrePurchaseOrderService.getPRToBeConvertedList(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                setPRListState((prevStates) => ({
                    ...prevStates,
                    prList: response.data.data
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
        setPRListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        if (!_.isEmpty(currentCompany) && prListState.gridApi) {
            getData();
        }
    }, [currentCompany, prListState.gridApi]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        if (data) {
            history.push({
                pathname: PURCHASE_ORDER_ROUTES.CONVERT_PR_TO_PO,
                search: `?uuid=${data.uuid}`,
                state: { status: data.prStatus }
            });
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PurchaseRequisitionsToBeConvertedList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={PRToBeConvertedListColDefs}
                        onGridReady={onGridReady}
                        colDef={defaultColDef}
                        rowData={prListState.prList}
                        gridHeight={580}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                        frameworkComponents={{
                            customTooltip: CustomTooltip
                        }}
                        tooltipShowDelay={0}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default PRToBeConvertedList;
