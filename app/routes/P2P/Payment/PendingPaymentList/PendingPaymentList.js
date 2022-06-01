import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import {
    Button,
    Col, Container, Row, Table
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";
import PaymentService from "services/PaymentService/PaymentService";
import { usePermission } from "routes/hooks";
import { FEATURE } from "helper/constantsDefined";
import { useLocation } from "react-router";
import { v4 as uuidv4 } from "uuid";
import pendingPaymentColDefs from "../ColumnDefs/PendingPaymentColDefs";
import PAYMENT_ROUTE from "../route";

const PendingPaymentList = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const location = useLocation();
    const history = useHistory();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [listState, setListState] = useState({
        loading: false,
        paymentList: [],
        category: "All",
        companyUuid: ""
    });
    const [gridApi, setGridApi] = useState();
    const [showAction, setShowAction] = useState(false);
    const [cellValueChange, setCellValueChange] = useState();

    const handleRolePermission = usePermission(FEATURE.MPAYM);

    const getData = async (currentCompanyUUID) => {
        gridApi.showLoadingOverlay();
        try {
            const res = await PaymentService.getPendingPaymentList(currentCompanyUUID);
            let listData = res.data.data;
            // Query params filter
            const query = new URLSearchParams(location.search);
            if (query.get("overdue")?.toLowerCase() === "true") {
                listData = listData.filter(({ overdueDays }) => !!overdueDays);
            }
            setListState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID,
                paymentList: listData.map((item) => ({
                    ...item,
                    isSelected: true,
                    vendorName: item.supplierDto.companyName,
                    fullyUnpaidAmt: item.processPaymentAmt + item.pendingPaymentAmount,
                    uuid: uuidv4()
                }))
            }));

            if (listData.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setListState((prevStates) => ({
            ...prevStates
        }));
        setGridApi(params.api);
    };
    const onSelectionChanged = (event) => {
        const selectedNode = event.api.getSelectedNodes();
        if (selectedNode.length > 0) {
            setShowAction(true);
            const newList = listState.paymentList.map((item) => {
                if (item.vendorName === selectedNode[0].data.vendorName
                    && item.currencyCode === selectedNode[0].data.currencyCode) {
                    return { ...item, isSelected: true };
                }
                return { ...item, isSelected: false };
            });

            setListState((prevStates) => ({
                ...prevStates,
                paymentList: [...newList]
            }));
            setCellValueChange(event);
            setTimeout(() => {
                setGridApi(event.api);
            }, 1000);
        } else {
            setShowAction(false);
            const newList = listState.paymentList.map((item) => ({
                ...item, isSelected: true
            }));
            setListState((prevStates) => ({
                ...prevStates,
                paymentList: newList
            }));
        }
    };

    useEffect(() => {
        if (cellValueChange) {
            const data = cellValueChange.api.getSelectedNodes()[0].data.uuid;
            if (cellValueChange.api.getSelectedNodes().length < 2) {
                setTimeout(() => {
                    gridApi.forEachNode((node) => {
                        node.setSelected(node.data.uuid === data);
                    });
                });
            }
        }
    }, [cellValueChange]);

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID) && gridApi) {
            getData(currentCompanyUUID);
        }
    }, [permissionReducer, gridApi]);

    const goToCreateDetail = async () => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        const selectedNode = gridApi.getSelectedNodes();
        const listInvoiceNo = selectedNode.map((item) => item.data.invoiceUuid);
        try {
            const res = await PaymentService
                .getPaymentCreateDetails(
                    currentCompanyUUID, listInvoiceNo
                );
            const { data, status, message } = res.data;
            if (status === "OK") {
                history.push(
                    {
                        pathname: PAYMENT_ROUTE.PAYMENT_CREATE,
                        state: { paymentDetails: data }
                    }
                );
            } else {
                showToast("error", message);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const selectCategory = (value) => {
        setListState((prevStates) => ({
            ...prevStates,
            category: value
        }));
    };

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Pending Payment Documents List")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Table className="mb-4 d-none" bordered>
                <tbody>
                    <tr style={{ height: "25px", color: "#000000" }}>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: listState.category === "All" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { selectCategory("All"); }}
                            aria-hidden="true"
                        >
                            {t("All")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: listState.category === "Purchases" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { selectCategory("Purchases"); }}
                            aria-hidden="true"
                        >
                            {t("Purchases")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: listState.category === "Subcon Work Request" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { selectCategory("Subcon Work Request"); }}
                            aria-hidden="true"
                        >
                            {t("Subcon Work Request")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: listState.category === "Rental" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { selectCategory("Rental"); }}
                            aria-hidden="true"
                        >
                            {t("Rental")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: listState.category === "Repair" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { selectCategory("Repair"); }}
                            aria-hidden="true"
                        >
                            {t("Repair")}
                        </td>
                    </tr>
                </tbody>
            </Table>
            <Row>
                <Col>
                    <div className="d-flex justify-content-end">
                        {handleRolePermission?.write && (
                            <Button color="primary" className="mb-2 mr-2 px-3" disabled={!showAction} onClick={() => goToCreateDetail()}>
                                <i className="fa fa-plus" />
                                {" "}
                                {t("Create Payment")}
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>
            <AgGridTable
                columnDefs={pendingPaymentColDefs(handleRolePermission?.write)}
                onGridReady={onGridReady}
                rowData={listState.paymentList}
                gridHeight={580}
                rowSelection="multiple"
                rowMultiSelectWithClick
                onSelectionChanged={onSelectionChanged}
            />
        </Container>
    );
};

export default PendingPaymentList;
