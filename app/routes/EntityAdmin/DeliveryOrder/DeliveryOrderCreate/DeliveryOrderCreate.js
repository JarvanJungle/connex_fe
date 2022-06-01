import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import useToast from "routes/hooks/useToast";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import { useHistory } from "react-router-dom";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import {
    Container,
    Button,
    Row,
    Col
} from "components";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { useCurrentCompany, usePermission } from "routes/hooks";
import { DeliveryOrderCreateColDefs } from "../ColumnDefs";
import DO_ROUTES from "../route";
import { DO_FE_STATUS, DO_STATUS } from "../doConfig";

const DeliveryOrderCreate = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const currentCompany = useCurrentCompany();
    const handleRolePermission = usePermission(FEATURE.DO);
    const [poListState, setPOListState] = useState({
        loading: false,
        poList: []
    });
    const [gridApi, setGridApi] = useState();
    const [showAction, setShowAction] = useState(false);
    const [cellValueChange, setCellValueChange] = useState();

    const convertStatus = (params) => {
        switch (params) {
        case DO_STATUS.PENDING_ISSUE:
        {
            return DO_FE_STATUS.PENDING_ISSUE;
        }
        case DO_STATUS.PENDING_RECEIPT:
        {
            return DO_FE_STATUS.PENDING_RECEIPT;
        }
        case DO_STATUS.DELIVERED:
        {
            return DO_FE_STATUS.DELIVERED;
        }
        case DO_STATUS.NOT_ISSUED:
        {
            return DO_FE_STATUS.NOT_ISSUED;
        }
        case DO_STATUS.PARTIALLY_ISSUED:
        {
            return DO_FE_STATUS.PARTIALLY_ISSUED;
        }
        case DO_STATUS.FULLY_ISSUED:
        {
            return DO_FE_STATUS.FULLY_ISSUED;
        }
        case DO_STATUS.PARTIALLY_DELIVERED:
        {
            return DO_FE_STATUS.PARTIALLY_DELIVERED;
        }
        default: return params;
        }
    };

    const getData = async () => {
        gridApi.showLoadingOverlay();
        try {
            const { companyUuid } = currentCompany;

            const response = await DeliveryOrderService.getDeliveryOrderPOList(companyUuid);
            gridApi.hideOverlay();

            if (response.data.status === RESPONSE_STATUS.OK) {
                setPOListState((prevStates) => ({
                    ...prevStates,
                    poList: response.data.data.map((item) => ({
                        ...item,
                        isSelected: true,
                        doStatus: convertStatus(item.doStatus),
                        canSelect: handleRolePermission?.write
                    }))
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
        setPOListState((prevStates) => ({
            ...prevStates
        }));
        setGridApi(params.api);
    };
    const onSelectionChanged = (event) => {
        const selectedNode = event.api.getSelectedNodes();
        if (selectedNode.length > 0) {
            setShowAction(true);
            const newList = poListState.poList.map((item) => {
                if (item.procurementType === selectedNode[0].data.procurementType
                    && item.buyerCompanyName === selectedNode[0].data.buyerCompanyName
                    && item.projectCode === selectedNode[0].data.projectCode) {
                    return { ...item, isSelected: true };
                }
                return { ...item, isSelected: false };
            });

            setPOListState((prevStates) => ({
                ...prevStates,
                poList: [...newList]
            }));
            setCellValueChange(event);
            setTimeout(() => {
                setGridApi(event.api);
            }, 1000);
        } else {
            setShowAction(false);
            const newList = poListState.poList.map((item) => ({
                ...item, isSelected: true
            }));
            setPOListState((prevStates) => ({
                ...prevStates,
                poList: newList
            }));
        }
    };

    useEffect(() => {
        if (cellValueChange) {
            const data = cellValueChange.api.getSelectedNodes()[0].data.poUuid;
            if (cellValueChange.api.getSelectedNodes().length < 2) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(node.data.poUuid === data);
                    });
                });
            }
        }
    }, [cellValueChange]);

    useEffect(() => {
        console.log("handleRolePermission", handleRolePermission);
        if (!_.isEmpty(currentCompany) && gridApi && handleRolePermission) {
            getData();
        }
    }, [currentCompany, gridApi, handleRolePermission]);

    const goToCreateDetail = async () => {
        const currentCompanyUUID = currentCompany.companyUuid;
        const selectedNode = gridApi.getSelectedNodes();
        const listPOUuid = selectedNode.map((item) => item.data.poUuid);
        try {
            const res = await DeliveryOrderService
                .getCreateDeliveryOrderDetails(
                    currentCompanyUUID, { poUuidList: listPOUuid }
                );
            const { data, status, message } = res.data;
            if (status === "OK") {
                history.push(
                    {
                        pathname: DO_ROUTES.DELIVERY_ORDER_CREATE_DETAILS,
                        state: { createDetail: data }
                    }
                );
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("CreateDeliveryOrder")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row>
                {
                    handleRolePermission?.write && (
                        <Col>
                            <div className="d-flex justify-content-end">
                                <Button color="primary" className="mb-2 mr-2 px-3" disabled={!showAction} onClick={() => goToCreateDetail()}>
                                    <i className="fa fa-plus" />
                                    {" "}
                                    {t("CreateDeliveryOrder")}
                                </Button>
                            </div>
                        </Col>
                    )
                }
            </Row>
            <AgGridTable
                columnDefs={DeliveryOrderCreateColDefs}
                onGridReady={onGridReady}
                rowData={poListState.poList}
                gridHeight={580}
                rowSelection="multiple"
                rowMultiSelectWithClick
                // onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                onSelectionChanged={onSelectionChanged}
            />
        </Container>
    );
};

export default DeliveryOrderCreate;
