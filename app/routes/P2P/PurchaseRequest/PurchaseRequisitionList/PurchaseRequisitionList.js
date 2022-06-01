import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import { AgGridTable } from "routes/components";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import _ from "lodash";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import { Container, Row, Col } from "components";
import { PURCHASE_REQUISITION_STATUS, FEATURE } from "helper/constantsDefined";
import { useHistory } from "react-router-dom";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { CustomTooltip } from "routes/P2P/GoodReceipts/components";
import { useLocation } from "react-router";
import { PurchaseRequisitionListColDefs } from "../ColumnDefs";
import PR_ROUTES from "../route";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip",
    sortable: true
};

const PurchaseRequisitionList = () => {
    const showToast = useToast();
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const permission = usePermission(FEATURE.PR);
    const [prListState, setPRListState] = useState({
        loading: false,
        gridApi: null,
        prList: []
    });

    const getData = async (companyUuid) => {
        const { gridApi } = prListState;
        gridApi.showLoadingOverlay();
        try {
            const response = await PurchaseRequestService.getListPurchaseRequisition(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let listPR = response.data.data;
                if (permission?.approve && !permission?.write && permission?.read) {
                    listPR = response.data.data.filter(
                        (item) => item.prStatus !== PURCHASE_REQUISITION_STATUS.RECALLED
                            && item.prStatus !== PURCHASE_REQUISITION_STATUS.SAVE_AS_DRAFT
                            && item.prStatus !== "SAVED AS DRAFT"
                    );
                }

                // Query params filter
                const query = new URLSearchParams(location.search);
                if (query.get("status")) {
                    listPR = listPR.filter((item) => query?.get("status")?.split(",")?.includes(item.prStatus) ?? true);
                }

                setPRListState((prevStates) => ({
                    ...prevStates,
                    prList: listPR
                }));

                if (listPR.length === 0) {
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
        if (!_.isEmpty(userDetails)
            && (permission?.read || permission?.approve || permission?.write)
            && prListState.gridApi
            && currentCompany
        ) {
            const { companyUuid } = currentCompany;
            if (companyUuid) getData(companyUuid);
        }
    }, [userDetails, prListState.gridApi, currentCompany, permission]);

    const onRowDoubleClicked = (params) => {
        const { data } = params;
        if (data.prStatus === PURCHASE_REQUISITION_STATUS.PENDING_APPROVAL) {
            history.push(`${PR_ROUTES.PURCHASE_REQUISITION_DETAILS}?uuid=${data.uuid}`);
        } else if (data.prStatus === PURCHASE_REQUISITION_STATUS.RECALLED
            || data.prStatus === PURCHASE_REQUISITION_STATUS.SENT_BACK) {
            history.push(`${PR_ROUTES.EDIT_PURCHASE_REQUISITION_DETAILS}?uuid=${data.uuid}`);
        } else if (data.prStatus === PURCHASE_REQUISITION_STATUS.SAVE_AS_DRAFT
            || data.prStatus === "SAVED AS DRAFT"
        ) {
            history.push(`${PR_ROUTES.EDIT_DRAFT_PURCHASE_REQUISITION}?uuid=${data.uuid}`);
        } else {
            history.push(`${PR_ROUTES.VIEW_REQUISITION_DETAILS}?uuid=${data.uuid}`);
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("PurchaseRequisitionsList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <AgGridTable
                columnDefs={PurchaseRequisitionListColDefs}
                onGridReady={onGridReady}
                rowData={prListState.prList}
                gridHeight={580}
                onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                colDef={defaultColDef}
                frameworkComponents={{
                    customTooltip: CustomTooltip
                }}
            />
        </Container>
    );
};

export default PurchaseRequisitionList;
