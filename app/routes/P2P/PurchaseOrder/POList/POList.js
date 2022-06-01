import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import {
    Container,
    Row,
    Col
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { useLocation } from "react-router";
import { POListColDefs, POListSupplierColDefs } from "../ColumnDefs";
import PURCHASE_ORDER_ROUTES from "../route";

const POList = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const [poListState, setPOListState] = useState({
        loading: false,
        gridApi: null,
        poList: [],
        isBuyer: false,
        colDefs: []
    });

    const getData = async (companyUuid) => {
        const { gridApi } = poListState;
        gridApi.showLoadingOverlay();
        try {
            const response = await PurchaseOrderService.getPOList(isBuyer, companyUuid);
            gridApi.hideOverlay();

            let listPO = response?.data?.data;

            // Query params filter
            const query = new URLSearchParams(location.search);
            if (query.get("status")) {
                listPO = listPO.filter((item) => query?.get("status")?.split(",")?.includes(item.status) ?? true);
            }
            if (query.get("supplierAck")) {
                listPO = listPO.filter((item) => query?.get("supplierAck")?.split(",")?.includes(item.supplierAck) ?? true);
            }

            setPOListState((prevStates) => ({
                ...prevStates,
                poList: listPO
            }));

            if (response.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setPOListState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (currentCompanyUUID
            && !_.isEmpty(userDetails)
            && poListState.gridApi
        ) {
            setPOListState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID,
                isBuyer,
                colDefs: isBuyer ? POListColDefs : POListSupplierColDefs
            }));

            getData(currentCompanyUUID);
        }
    }, [permissionReducer, userDetails, poListState.gridApi, isBuyer]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        history.push({
            pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
            search: `?uuid=${data.poUuid}`,
            state: { data }
        });
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PurchaseOrdersList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={poListState.colDefs}
                        onGridReady={onGridReady}
                        rowData={poListState.poList}
                        gridHeight={580}
                        onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default POList;
