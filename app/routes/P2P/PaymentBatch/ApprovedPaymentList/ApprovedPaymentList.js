import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { usePermission } from "routes/hooks";
import { AgGridTable } from "routes/components";
import {
    Col, Container, Row, Table, ButtonToolbar, Button
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import { FEATURE, RESPONSE_STATUS } from "helper/constantsDefined";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import PAYMENT_BATCH_ROUTES from "../route";
import { approvedPaymentListColDefs } from "../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const ApprovedPaymentList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [gridApi, setGridApi] = useState(null);
    const [category, setCategory] = useState("All");
    const [paymentList, setPaymentList] = useState([]);
    const [showAction, setShowAction] = useState(false);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [companyUuid, setCompanyUuid] = useState();
    const permission = usePermission(FEATURE.MPAYM);

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setGridApi(params.api);
    };

    const initData = async (currentCompanyUuid) => {
        setCompanyUuid(currentCompanyUuid);
        gridApi.showLoadingOverlay();
        try {
            const response = await PaymentBatchService.getApprovedPaymentList(currentCompanyUuid);
            const { data } = response && response.data;
            const payments = data.map((item) => ({
                ...item,
                allowSelected: true
            }));
            setPaymentList(payments);
            if (response.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    useEffect(() => {
        const currentCompanyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
        if (currentCompanyUuid && gridApi) {
            initData(currentCompanyUuid);
        }
    }, [permissionReducer, gridApi]);

    const onSelectionChanged = (event) => {
        const selectedNodes = event.api.getSelectedNodes();
        const data = selectedNodes.map((item) => item.data);
        if (data.length > 0) {
            setShowAction(true);
            const newList = paymentList.map((item) => {
                if (item.currencyCode === data[0].currencyCode) {
                    return { ...item, allowSelected: true };
                }
                return { ...item, allowSelected: false };
            });

            setPaymentList([...newList]);
            setSelectedPayments(data);

            setTimeout(() => {
                gridApi.forEachNode((node) => node.setSelected(data.some(({ uuid }) => node.data.uuid === uuid)));
            });
        } else {
            setShowAction(false);
            const newList = paymentList.map((item) => ({
                ...item, allowSelected: true
            }));
            setPaymentList(newList);
            setSelectedPayments([]);
        }
    };

    const createPaymentBatch = async () => {
        try {
            const paymentUuids = selectedPayments.map((item) => item.uuid);
            const response = await PaymentBatchService.getDetailsPaymentForCreatingPaymentBatch(
                companyUuid, paymentUuids
            );
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response && response.data;
                history.push({
                    pathname: PAYMENT_BATCH_ROUTES.PAYMENT_BATCH_CREATE,
                    state: data
                });
            } else {
                showToast("error", response.data.message);
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
                        title={t("ApprovedPaymentInvoiceList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Table className="mb-4 d-none" bordered>
                <tbody>
                    <tr style={{ height: "25px", color: "#000000", userSelect: "none" }}>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: category === "All" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { setCategory("All"); }}
                            aria-hidden="true"
                        >
                            {t("All")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: category === "Purchases" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { setCategory("Purchases"); }}
                            aria-hidden="true"
                        >
                            {t("Purchases")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: category === "Subcon Work Request" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { setCategory("Subcon Work Request"); }}
                            aria-hidden="true"
                        >
                            {t("Subcon Work Request")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: category === "Rental" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { setCategory("Rental"); }}
                            aria-hidden="true"
                        >
                            {t("Rental")}
                        </td>
                        <td
                            style={{ width: "20%", cursor: "pointer", backgroundColor: category === "Repair" ? "#AEC57D" : "#f9fafc" }}
                            className="align-middle"
                            onClick={() => { setCategory("Repair"); }}
                            aria-hidden="true"
                        >
                            {t("Repair")}
                        </td>
                    </tr>
                </tbody>
            </Table>
            <ButtonToolbar className="justify-content-end my-2">
                {(permission?.write && permission?.read) && (
                    <Button
                        color="primary"
                        onClick={() => createPaymentBatch()}
                        className="mr-1"
                        style={{
                            height: 36
                        }}
                        disabled={!showAction}
                    >
                        <i className="mr-1 fa fa-plus" />
                        <span>{t("CreatePaymentBatch")}</span>
                    </Button>
                )}
            </ButtonToolbar>
            <AgGridTable
                columnDefs={approvedPaymentListColDefs(permission?.write && permission?.read)}
                onGridReady={onGridReady}
                rowData={paymentList}
                gridHeight={580}
                // onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                onSelectionChanged={onSelectionChanged}
                frameworkComponents={{
                    customTooltip: CustomTooltip
                }}
                colDef={defaultColDef}
            />
        </Container>
    );
};

export default ApprovedPaymentList;
