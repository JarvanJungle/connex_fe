import React, { useEffect, useRef, useState } from "react";
import { AgGridTable } from "routes/components";
import {
    Container,
    Row,
    Col,
    Button
} from "components";
import { HeaderMain } from "routes/components/HeaderMain";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import InvoiceService from "services/InvoiceService/InvoiceService";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { useLocation } from "react-router";
import ColumnDefs from "./ColumnDefs";
import useToast from "../../../hooks/useToast";
import INVOICE_ROUTES from "../route";
import { categoryInvoice } from "../helper/constant";
import { opcPendingInvoiceListBuyerColDefs } from "../ColumnDefs/InvoiceListColDefs";

const InvoicePendingApprovalList = () => {
    const showToast = useToast();
    const { t } = useTranslation();
    const history = useHistory();
    const location = useLocation();
    const permissionReducer = useSelector((state) => state?.permissionReducer);
    const [categoryActive, setCategoryActive] = useState(categoryInvoice.purchases);

    const dataListRef = useRef();
    const [state, setState] = useState({
        loading: false,
        gridApi: null,
        colDefs: ColumnDefs
    });

    const [invoiceList, setInvoiceList] = useState([]);

    const getData = async (companyUuid) => {
        const { gridApi } = state;
        try {
            let listData = (await InvoiceService.getInvoicePendingApprovalList(companyUuid))?.data?.data;

            // Query params filter
            const query = new URLSearchParams(location.search);
            if (query.get("status")) {
                listData = listData.filter((item) => query?.get("status")?.split(",")?.includes(item.invoiceStatus) ?? true);
            }

            dataListRef.current = listData;
            gridApi.hideOverlay();
            setInvoiceList(listData);
            if (listData?.length === 0) {
                gridApi.showNoRowsOverlay();
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setState((prevStates) => ({
            ...prevStates,
            gridApi: params.api
        }));
    };
    const filterRecord = async (category) => {
        switch (category) {
        case categoryInvoice.purchases:
            setCategoryActive(categoryInvoice.purchases);
            setState({
                ...state,
                colDefs: ColumnDefs
            });
            setInvoiceList(dataListRef.current);
            break;

        case categoryInvoice.developerWorkRequests:
            if (categoryActive !== categoryInvoice.developerWorkRequests) {
                try {
                    const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                    const response = await InvoiceService.getOPCInvoicePendingApprovalList(companyUuid);
                    setInvoiceList(response.data.data);
                    setCategoryActive(categoryInvoice.developerWorkRequests);
                    state.gridApi.setColumnDefs([]);
                } catch (error) {
                    showToast("error", error.response ? error.response.data.message : error.message);
                } finally {
                    setState({
                        ...state,
                        colDefs: opcPendingInvoiceListBuyerColDefs
                    });
                }
            }
            break;

        default:
            break;
        }
    };
    const onRowDoubleClicked = (params) => {
        const { invoiceUuid } = params && params.data;
        if (categoryActive === categoryInvoice.developerWorkRequests) {
            history.push({
                pathname: INVOICE_ROUTES.INV_PENDING_AP_DETAILS,
                search: `?uuid=${invoiceUuid}&isOPC=true`
            });
        } else {
            history.push({
                pathname: INVOICE_ROUTES.INV_PENDING_AP_DETAILS,
                search: `?uuid=${invoiceUuid}`
            });
        }
    };

    useEffect(() => {
        if (permissionReducer?.currentCompany?.companyUuid && state.gridApi) {
            getData(permissionReducer.currentCompany.companyUuid);
        }
    }, [permissionReducer, state.gridApi]);

    return (
        <Container fluid>
            <Row className="mb-1">
                <Col xs={12} className="text-right">

                    <Button
                        color={categoryActive === categoryInvoice.purchases ? "secondary" : "transparent"}
                        onClick={() => filterRecord(categoryInvoice.purchases)}
                    >
                        {t("Purchases")}
                    </Button>
                    <Button
                        color={categoryActive === categoryInvoice.developerWorkRequests ? "secondary" : "transparent"}
                        onClick={() => filterRecord(categoryInvoice.developerWorkRequests)}
                    >
                        {t("Developer Work Requests")}
                    </Button>
                </Col>
            </Row>
            <Row className="mb-1">
                <Col lg={12}>
                    <HeaderMain
                        title={t("InvoicePendingApprovalList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    <AgGridTable
                        gridHeight={580}
                        columnDefs={state.colDefs}
                        rowData={invoiceList}
                        onGridReady={onGridReady}
                        onRowDoubleClicked={onRowDoubleClicked}
                        autoSizeColumn={false}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default InvoicePendingApprovalList;
