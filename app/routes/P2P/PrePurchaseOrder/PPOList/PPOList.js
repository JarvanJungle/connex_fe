import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import useToast from "routes/hooks/useToast";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { RESPONSE_STATUS, FEATURE } from "helper/constantsDefined";
import {
    Container,
    Row,
    Col
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { PPOListColDefs } from "../ColumnDefs";
import PRE_PURCHASE_ORDER_ROUTES from "../route";
import { PURCHASE_ORDER_ROUTES } from "../../PurchaseOrder";

const PPOList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const [prListState, setPRListState] = useState({
        loading: false,
        gridApi: null,
        prList: []
    });
    const currentCompany = useCurrentCompany();
    const permission = usePermission(FEATURE.PPO);

    const getData = async () => {
        const { gridApi } = prListState;
        gridApi.showLoadingOverlay();
        try {
            const { companyUuid } = currentCompany;

            const response = await PrePurchaseOrderService.getPPOList(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let prList = response.data.data;
                if (permission?.read && permission?.approve && !permission?.write) {
                    prList = prList.filter((item) => item.prePoStatus !== "SAVED_AS_DRAFT"
                        && item.prePoStatus !== "SAVE_AS_DRAFT"
                        && item.prePoStatus !== "RECALLED");
                }

                setPRListState((prevStates) => ({
                    ...prevStates,
                    prList
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
        if ((permission?.read || permission?.write || permission?.approve)
            && prListState?.gridApi
        ) {
            getData();
        }
    }, [permission, prListState?.gridApi]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        if (data.prePoStatus === "SAVED_AS_DRAFT"
            || data.prePoStatus === "SAVE_AS_DRAFT"
            || data.prePoStatus === "RECALLED"
            || data.prePoStatus === "SENT_BACK"
        ) {
            history.push(`${PRE_PURCHASE_ORDER_ROUTES.PPO_DETAILS}?uuid=${data.uuid}`);
        } else if (data.prePoStatus === "PENDING_CONVERT_TO_PO") {
            history.push(`${PURCHASE_ORDER_ROUTES.CONVERT_PPO_TO_PO}?uuid=${data.uuid}`);
        } else {
            history.push(`${PRE_PURCHASE_ORDER_ROUTES.PPO_IN_PROGRESS}?uuid=${data.uuid}`);
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PrePurchaseOrderList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={PPOListColDefs}
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

export default PPOList;
