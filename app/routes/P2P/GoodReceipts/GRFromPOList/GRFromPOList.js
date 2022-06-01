import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col, Button, ButtonToolbar
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import { POListColDefs } from "../ColumnDefs";
import GOODS_RECEIPT_ROUTES from "../route";

const GRFromPOList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const [poListState, setPOListState] = useState({
        loading: false,
        poList: [],
        listSelectedPO: []
    });
    const [gridApi, setGridApi] = useState(null);
    const [showAction, setShowAction] = useState(false);

    const getData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await GoodsReceiptService.getListPOForCreatingGR(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                let poList = response.data && response.data.data;
                poList = poList.map((item) => ({ ...item, allowSelect: true }));
                poList = poList.filter(
                    (item) => (
                        item.status !== "REJECTED"
                        && item.status !== "CANCELLED"
                        && item.status !== "PENDING_REVIEW"
                    )
                );
                setPOListState((prevStates) => ({
                    ...prevStates,
                    poList
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
        setGridApi(params.api);
    };

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const data = selectedNodes.map((item) => item.data);
        const { poList } = poListState;
        if (data.length > 0) {
            setShowAction(true);
            const newList = poList.map((item) => {
                if (item.supplierName === data[0].supplierName
                    && item.procurementType === data[0].procurementType
                ) {
                    return { ...item, allowSelect: true };
                }
                return { ...item, allowSelect: false };
            });

            setPOListState((prevStates) => ({
                ...prevStates,
                listSelectedPO: data,
                poList: [...newList]
            }));
            if (data.length === 1) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(node.data.uuid === data[0].uuid);
                    });
                });
            }
        } else {
            setShowAction(false);
            const newList = poList.map((item) => ({ ...item, allowSelect: true }));
            setPOListState((prevStates) => ({
                ...prevStates,
                listSelectedPO: [],
                poList: [...newList]
            }));
        }
    };

    const navigateToCreateGR = async () => {
        try {
            const { listSelectedPO, companyUuid } = poListState;
            const poUuids = listSelectedPO.map((item) => item.uuid);
            const response = await GoodsReceiptService.getDetailsPOForCreatingGR(
                companyUuid, poUuids
            );
            const { data, status, message } = response && response.data;
            if (status !== RESPONSE_STATUS.OK) {
                showToast("error", message);
                return;
            }
            history.push({
                pathname: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_PO,
                state: { data: { grDetails: data, poUuids } }
            });
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    useEffect(() => {
        if (!_.isEmpty(userDetails)
            && gridApi
            && !_.isEmpty(currentCompany)
        ) {
            const { companyUuid } = currentCompany;
            if (companyUuid) {
                setPOListState((prevStates) => ({
                    ...prevStates,
                    companyUuid
                }));
                getData(companyUuid);
            }
        }
    }, [userDetails, gridApi, currentCompany]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("CreateReceiptFromPO")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <ButtonToolbar className="justify-content-end mb-2">
                <Button
                    color="primary"
                    onClick={() => navigateToCreateGR()}
                    className="mr-1"
                    style={{
                        height: 36
                    }}
                    disabled={!showAction}
                >
                    <i className="fa fa-plus mr-1" />
                    <span>{t("CreateGoodsReceipt")}</span>
                </Button>
            </ButtonToolbar>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={POListColDefs}
                        onGridReady={onGridReady}
                        rowData={poListState.poList}
                        gridHeight={580}
                        onSelectionChanged={onSelectionChanged}
                        rowSelection="multiple"
                        autoSizeColumn={false}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default GRFromPOList;
