import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col, ButtonToolbar, Button
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import { DOListColDefs } from "../ColumnDefs";
import GOODS_RECEIPT_ROUTES from "../route";
import GR_CONSTANTS from "../constants/constants";

const GRFromDOList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { currentCompany } = permissionReducer;
    const [doListState, setDOListState] = useState({
        loading: false,
        doList: [],
        listSelectedDO: [],
        companyUuid: ""
    });
    const [gridApi, setGridApi] = useState(null);
    const [showAction, setShowAction] = useState(false);

    const getData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await GoodsReceiptService.getListDOForCreatingGR(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const newList = data.map((item) => ({ ...item, allowSelect: true }))
                    .filter((item) => item.status === GR_CONSTANTS.PENDING_RECEIPT);
                setDOListState((prevStates) => ({
                    ...prevStates,
                    doList: newList.map((doItem) => ({
                        ...doItem,
                        status: doItem.status.replaceAll("_", " ")
                    })),
                    companyUuid
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

    const navigateToDODetails = async () => {
        try {
            const { listSelectedDO, companyUuid } = doListState;
            const doUuids = listSelectedDO.map((item) => item.uuid);
            const response = await GoodsReceiptService.getDetailsDOForCreatingGR(
                companyUuid, doUuids
            );
            const { data, status, message } = response && response.data;
            if (status !== RESPONSE_STATUS.OK) {
                showToast("error", message);
                return;
            }
            history.push({
                pathname: GOODS_RECEIPT_ROUTES.CREATE_GR_FROM_DO,
                state: { data: { grDetails: data, doUuids } }
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
            if (companyUuid) getData(companyUuid);
        }
    }, [userDetails, gridApi, currentCompany]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const data = selectedNodes.map((item) => item.data);
        const { doList } = doListState;
        if (data.length > 0) {
            setShowAction(true);
            const newList = doList.map((item) => {
                if (item.supplierName === data[0].supplierName
                    && item.procurementType === data[0].procurementType
                ) {
                    return { ...item, allowSelect: true };
                }
                return { ...item, allowSelect: false };
            });

            setDOListState((prevStates) => ({
                ...prevStates,
                doList: [...newList],
                listSelectedDO: data
            }));
            if (data.length === 1) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(
                            node.data.uuid === data[0].uuid
                            && node.data.supplierName === data[0].supplierName
                            && node.data.procurementType === data[0].procurementType
                        );
                    });
                });
            }
        } else {
            setShowAction(false);
            const newList = doListState.doList.map((item) => ({
                ...item, allowSelect: true
            }));
            setDOListState((prevStates) => ({
                ...prevStates,
                doList: newList,
                listSelectedDO: []
            }));
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("CreateReceiptFromDO")}
                        className="mb-1 mb-lg-1"
                    />
                </Col>
            </Row>
            <ButtonToolbar className="justify-content-end mb-2">
                <Button
                    color="primary"
                    onClick={() => navigateToDODetails()}
                    className="mb-2 mr-2 px-3"
                    style={{
                        height: 36
                    }}
                    disabled={!showAction}
                >
                    <i className="fa fa-plus" />
                    {" "}
                    <span>{t("CreateGoodsReceipt")}</span>
                </Button>
            </ButtonToolbar>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        columnDefs={DOListColDefs}
                        onGridReady={onGridReady}
                        rowData={doListState.doList}
                        gridHeight={500}
                        onSelectionChanged={onSelectionChanged}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default GRFromDOList;
