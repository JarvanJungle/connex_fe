import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { usePermission } from "routes/hooks";
import { useLocation } from "react-router";
import { GRListColDefs } from "../ColumnDefs";
import GOODS_RECEIPT_ROUTES from "../route";

const GRList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const location = useLocation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;

    const [prListState, setPRListState] = useState({
        loading: false,
        gridApi: null,
        prList: []
    });
    const handleRolePermission = usePermission(FEATURE.GR);

    const getData = async (companyUuid) => {
        const { gridApi } = prListState;
        gridApi.showLoadingOverlay();
        try {
            const response = await GoodsReceiptService.getGRList(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let listData = response.data.data;
                if (handleRolePermission?.approve && !handleRolePermission?.write) {
                    listData = listData.filter((item) => item.grStatus
                    !== "SAVE_AS_DRAFT");
                }
                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    listData = listData.filter((item) => query?.get("status")?.split(",")?.includes(item.grStatus) ?? true);
                }
                setPRListState((prevStates) => ({
                    ...prevStates,
                    prList: listData
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
        const { gridApi } = prListState;
        if (!_.isEmpty(userDetails)
            && gridApi
            && currentCompany
        ) {
            const { companyUuid } = currentCompany;
            if (companyUuid && handleRolePermission) getData(companyUuid);
        }
    }, [userDetails, currentCompany, prListState.gridApi, handleRolePermission]);

    const onRowDoubleClicked = (params) => {
        const { uuid } = params && params.data;
        history.push({
            pathname: GOODS_RECEIPT_ROUTES.GR_LIST_GR_DETAILS,
            search: `?uuid=${uuid}`
        });
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("ReceiptsList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={GRListColDefs}
                        onGridReady={onGridReady}
                        rowData={prListState.prList}
                        gridHeight={580}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default GRList;
