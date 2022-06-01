import React, { useState, useEffect } from "react";
import { AgGridTable } from "routes/components";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import {
    Col, Container, Row, Table
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { ApprovedInvoiceListDummyData } from "../helper";
import { ApprovedInvoiceListColDefs } from "../ColumnDefs";
import PAYMENT_ROUTE from "../route";
import PaymentService from "services/PaymentService/PaymentService";
import { isNullOrUndefinedOrEmpty } from "helper/utilities";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";

const ApprovedInvoiceList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const { userDetails } = authReducer;
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const [listState, setListState] = useState({
        loading: false,
        paymentList: [],
        category: "All"
    });
    const [gridApi, setGridApi] = useState();

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setListState((prevStates) => ({
            ...prevStates
        }));
        setGridApi(params.api);
    };

    const getData = async (currentCompanyUUID) => {
        gridApi.showLoadingOverlay();
        try {
            const res = await PaymentService.getApprovedInvoiceList(currentCompanyUUID);
            console.log("getData ~ res", res.data.data);

            setListState((prevStates) => ({
                ...prevStates,
                companyUuid: currentCompanyUUID,
                paymentList: res.data.data.map((item) => ({
                    ...item,
                    isSelected: true,
                    vendorName: item.supplierDto.companyName,
                    fullyUnpaidAmt: item.processPaymentAmt + item.pendingPaymentAmount
                }))
            }));

            if (res.data.data.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    useEffect(() => {
        if (!_.isEmpty(userDetails) && listState.gridApi) {
            getData();
        }
    }, [userDetails, listState.gridApi]);

    const selectCategory = (value) => {
        setListState((prevStates) => ({
            ...prevStates,
            category: value
        }));
    };

    const onRowDoubleClicked = (params) => {
        history.push(
            `${INVOICE_ROUTES.INV_DETAILS}?uuid=${params?.data?.invoiceUuid}`
        );
    };

    useEffect(() => {
        const currentCompanyUUID = permissionReducer?.currentCompany?.companyUuid;
        if (!isNullOrUndefinedOrEmpty(currentCompanyUUID) && gridApi) {
            getData(currentCompanyUUID);
        }
    }, [permissionReducer, gridApi]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("Approved Invoices List")}
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
            <AgGridTable
                columnDefs={ApprovedInvoiceListColDefs}
                onGridReady={onGridReady}
                rowData={listState.paymentList}
                gridHeight={580}
                onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
            />
        </Container>
    );
};

export default ApprovedInvoiceList;
