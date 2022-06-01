/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { AgGridTable } from "routes/components";
import InvoiceService from "services/InvoiceService/InvoiceService";
import _ from "lodash";
import { useSelector } from "react-redux";
import useToast from "routes/hooks/useToast";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    Container, Row, Col, Button
} from "components";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderMain } from "routes/components/HeaderMain";
import { getCurrentCompanyUUIDByStore } from "helper/utilities";
import { getInvoiceListColDefs } from "../ColumnDefs";
import INVOICE_ROUTES from "../route";
import { INVOICE_CONSTANTS } from "../helper";
import { getOpcInvoiceListColDefs } from "../ColumnDefs/InvoiceListColDefs";
import { STATUS_DEVELOPER_INVOICE } from "../helper/constant";

const categoryInvoice = {
    all: "All",
    purchases: "Purchases",
    subconWorkRequests: "Subcon Work Requests",
    developerWorkRequests: "Developer Work Requests"
};

const InvoiceList = () => {
    const showToast = useToast();
    const history = useHistory();
    const { t } = useTranslation();
    const authReducer = useSelector((state) => state.authReducer);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { userDetails } = authReducer;
    const { isBuyer } = permissionReducer;
    const [gridApi, setGridApi] = useState(null);
    const [cnList, setCNList] = useState([]);
    const [categoryActive, setCategoryActive] = useState(categoryInvoice.purchases);
    const [colDefs, setColDefs] = useState(getInvoiceListColDefs(isBuyer));

    const cnListRef = useRef([]);

    const getData = async (companyUuid) => {
        gridApi.showLoadingOverlay();
        try {
            const response = await InvoiceService.getInvList(companyUuid, isBuyer);

            gridApi.hideOverlay();
            if (response.data.status === RESPONSE_STATUS.OK) {
                setCNList(response.data.data);
                cnListRef.current = response.data.data;
                if (response.data.data.length === 0) {
                    gridApi.showNoRowsOverlay();
                }
            } else {
                showToast("error", response.data.message);
            }
            gridApi.showNoRowsOverlay();
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
            gridApi.showNoRowsOverlay();
        }
    };

    const onGridReady = (params) => {
        params.api.showLoadingOverlay();
        setGridApi(params.api);
    };

    useEffect(() => {
        if (!_.isEmpty(userDetails)
            && gridApi
            && !_.isEmpty(permissionReducer)
            && typeof isBuyer === "boolean"
        ) {
            const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
            if (companyUuid) getData(companyUuid);
            // setColumnDefs(getInvoiceListColDefs(isBuyer));
        }
    }, [userDetails, permissionReducer, gridApi, isBuyer]);

    const onRowDoubleClicked = (params) => {
        const { invoiceUuid, invoiceStatus } = params && params.data;
        if (categoryActive === categoryInvoice.developerWorkRequests) {
            if (invoiceStatus === INVOICE_CONSTANTS.CONVERT_BY_ARCHITECT) {
                history.push({
                    pathname: INVOICE_ROUTES.CREATE_INV,
                    search: `?invoiceType=OPC_INVOICE&OPC=${invoiceUuid}`
                });
            } else if (
                invoiceStatus === INVOICE_CONSTANTS.PENDING_INVOICE_APPROVAL
                || invoiceStatus === INVOICE_CONSTANTS.PENDING_APPROVAL
            ) {
                history.push({
                    pathname: INVOICE_ROUTES.INV_PENDING_AP_DETAILS,
                    search: `?uuid=${invoiceUuid}&isOPC=true`
                });
            } else {
                history.push({
                    pathname: INVOICE_ROUTES.INV_DETAILS,
                    search: `?uuid=${invoiceUuid}&isOPC=true`
                });
            }
        } else if ((invoiceStatus === INVOICE_CONSTANTS.APPROVED_TWO_WAY
                || invoiceStatus === INVOICE_CONSTANTS.APPROVED_THREE_WAY)
                && isBuyer
        ) {
            history.push({
                pathname: INVOICE_ROUTES.INV_PENDING_AP_DETAILS,
                search: `?uuid=${invoiceUuid}`
            });
        } else {
            history.push({
                pathname: INVOICE_ROUTES.INV_DETAILS,
                search: `?uuid=${invoiceUuid}`
            });
        }
    };

    const filterRecord = async (category) => {
        switch (category) {
        case categoryInvoice.purchases:
            setCategoryActive(categoryInvoice.purchases);
            setColDefs(getInvoiceListColDefs(isBuyer));
            setCNList(cnListRef.current);
            break;
        case categoryInvoice.subconWorkRequests:
            setColDefs(getInvoiceListColDefs(isBuyer));
            setCategoryActive(categoryInvoice.subconWorkRequests);
            break;
        case categoryInvoice.developerWorkRequests:
            if (categoryActive !== categoryInvoice.developerWorkRequests) {
                try {
                    const companyUuid = getCurrentCompanyUUIDByStore(permissionReducer);
                    const response = await InvoiceService.getOPCInvoiceLIST(companyUuid, isBuyer);
                    let array = response.data.data;
                    if (isBuyer) {
                        array = array.filter((item) => item.invoiceStatus !== INVOICE_CONSTANTS.CONVERT_BY_ARCHITECT);
                    }
                    setCategoryActive(categoryInvoice.developerWorkRequests);
                    gridApi.setColumnDefs([]);
                    setColDefs(getOpcInvoiceListColDefs(isBuyer));
                    setCNList(array);
                } catch (error) {
                    showToast("error", error.response ? error.response.data.message : error.message);
                }
            }
            break;

        default:
            break;
        }
    };

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
                        title={t("InvoicesList")}
                        className="mb-3 mb-lg-3"
                    />
                </Col>
            </Row>
            <Row className="mb-3">
                <Col lg={12}>
                    {
                        permissionReducer && permissionReducer?.currentCompany
                            && (
                                <AgGridTable
                                    columnDefs={colDefs}
                                    deltaRowDataMode
                                    onGridReady={onGridReady}
                                    rowData={cnList}
                                    gridHeight={580}
                                    applyColumnDefOrder
                                    onRowDoubleClicked={(params) => onRowDoubleClicked(params)}
                                />
                            )
                    }
                </Col>
            </Row>
        </Container>
    );
};

export default InvoiceList;
