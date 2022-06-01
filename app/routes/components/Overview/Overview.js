import React, { useEffect, useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import {
    Nav,
    NavItem,
    NavLink,
    Card,
    CardBody
} from "components";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import PrePurchaseOrderService from "services/PrePurchaseOrderService/PrePurchaseOrderService";
import InvoiceService from "services/InvoiceService/InvoiceService";
import PurchaseOrderService from "services/PurchaseOrderService/PurchaseOrderService";
import PaymentService from "services/PaymentService/PaymentService";
import GoodsReceiptService from "services/GoodsReceiptService/GoodsReceiptService";
import PurchaseRequestService from "services/PurchaseRequestService/PurchaseRequestService";
import PreRequisitionService from "services/PreRequisitionService";
import { IconButton } from "@material-ui/core";
import AuditTrailDOColDefs from "./AuditTrailColDefs";
import { AgGridTable } from "../AgGridTable";
import OverviewColDefs from "./OverviewColDefs";
import RequestForQuotationService from "services/RequestForQuotationService";
import PaymentBatchService from "services/PaymentBatchService/PaymentBatchService";
import { useSelector } from "react-redux";

const useStyles = makeStyles({
    "custom-nav": {
        "&.nav-tabs": {
            borderBottom: "2px solid #DEE2E6"
        },
        "&.nav": {
            padding: "0 16px"
        },
        "&.nav-tabs .nav-link": {
            marginBottom: "-2px",
            border: "2px solid transparent"
        },
        "&.nav-tabs .nav-link.active, &.nav-tabs .nav-item.show .nav-link": {
            borderColor: "#DEE2E6 #DEE2E6 #FFF"
        }
    },
    "custom-card": {
        "&.card": {
            border: 0,
            borderRadius: 0
        }
    }
});

const defaultColDef = {
    editable: false,
    filter: false,
    floatingFilter: false,
    resizable: true,
    sortable: true
};

const Overview = (props) => {
    const {
        rowData,
        rowDataAuditTrail,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        autoGroupColumnDef,
        getDataPath,
        activeTab,
        setActiveTab,
        paginationPageSize,
        companyUuid
    } = props;

    const { t } = useTranslation();
    const classes = useStyles();
    const history = useHistory();
    const [rowDataOverview, setRowDataOverview] = useState(rowData);
    const permissionReducer = useSelector((state) => state.permissionReducer);
    const { isBuyer } = permissionReducer;

    const goToDetails = (params) => {
        const pprRoute = "/pre-requisitions/details";
        const prRoute = "/requisition/view-pr-details";
        const ppoRoute = "/ppo-in-progress";
        const poRoute = "/po-details";
        const doRoute = "/delivery-order/details";
        const grRoute = "/good-receipts/gr-details";
        const invRoute = "/invoice-details";
        const payRoute = "/payment/payment-details";
        const rfqRoute = "/rfq/rfq-details";
        const { data } = params;
        switch (data.type) {
        case "PPR":
            history.push({
                pathname: pprRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "PR":
            history.push({
                pathname: prRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "PPO":
            history.push({
                pathname: ppoRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "PO":
            history.push({
                pathname: poRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "DO":
            history.push({
                pathname: doRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "GR":
            history.push({
                pathname: grRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "INV":
            history.push({
                pathname: invRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "PAY":
            history.push({
                pathname: payRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        case "RFQ":
            history.push({
                pathname: rfqRoute,
                search: `?uuid=${data.uuid}`,
                state: { }
            });
            break;
        default: break;
        }
    };

    const LinkCellRenderer = (params) => {
        const { data } = params;
        if (isBuyer && data.type === "DO") {
            return (
                <div>
                    {data?.documentNumber}
                </div>
            );
        }
        return (
            <div className="linkDetail" onClick={() => goToDetails(params)} aria-hidden="true">
                {data?.documentNumber}
            </div>
        );
    };

    const showChild = async (params) => {
        const { data, agGridReact } = params;
        const rowDataCol = agGridReact?.props?.rowData;
        const newRowData = [...rowDataCol];
        newRowData.forEach((item) => {
            if (item.uuid === data.uuid) {
                item.isChild = true;
            }
            item.loading = true;
        });
        setRowDataOverview(newRowData);
        params.api.setRowData(newRowData);
        let resOverview;
        switch (data.type) {
        case "PR":
            resOverview = await PurchaseRequestService
                .getDetailsPurchaseRequisitionOverview(companyUuid, data.uuid, true);
            break;
        case "PPO":
            resOverview = await PrePurchaseOrderService
                .getPPOOverviewDetails(companyUuid, data.uuid, true);
            break;
        case "PO":
            resOverview = await PurchaseOrderService
                .getDetailsPOOverview(companyUuid, data.uuid, true);
            break;
        case "DO":
            resOverview = await DeliveryOrderService
                .getDOOverview(companyUuid, data.uuid, true);
            break;
        case "GR":
            resOverview = await GoodsReceiptService
                .grOverviewDetails(companyUuid, data.uuid, true);
            break;
        case "INV":
            resOverview = await PaymentService.getOverviewByInvoice(
                companyUuid, data.uuid, true
            );
            break;
        case "PAY":
            resOverview = await PaymentService.getPaymentOverview(
                companyUuid, data.uuid, true
            );
            break;
        default:
            break;
        }
        const dataChild = resOverview ? resOverview.data.data : [];
        dataChild.forEach((item) => {
            newRowData.push({
                ...item,
                type: item.documentType,
                documentType: [...data.documentType, item.documentNumber],
                hasParent: true
            });
        });
        newRowData.forEach((item) => {
            item.loading = false;
        });
        setRowDataOverview(newRowData);
        params.api.setRowData(newRowData);
    };

    const showParent = async (params) => {
        const { data, agGridReact } = params;
        const rowDataCol = agGridReact?.props?.rowData;
        const newRowData = [...rowDataCol];
        newRowData.forEach((item) => {
            if (item.documentNumber === data.documentNumber) {
                item.hasParent = true;
            }
            item.loading = true;
        });
        setRowDataOverview(newRowData);
        params.api.setRowData(newRowData);
        if (data.parentDocumentType.length > 0) {
            data.parentDocumentType.forEach(async (item, index) => {
                let resOverview;
                switch (item) {
                case "PPR":
                    resOverview = await PreRequisitionService
                        .getPPROverview(
                            companyUuid, data.parentDocumentUuid[index], false
                        );
                    break;
                case "PR":
                    resOverview = await PurchaseRequestService
                        .getDetailsPurchaseRequisitionOverview(
                            companyUuid, data.parentDocumentUuid[index], false
                        );
                    break;
                case "PPO":
                    resOverview = await PrePurchaseOrderService
                        .getPPOOverviewDetails(companyUuid, data.parentDocumentUuid[index], false);
                    break;
                case "PO":
                    resOverview = await PurchaseOrderService
                        .getDetailsPOOverview(companyUuid, data.parentDocumentUuid[index], false);
                    break;
                case "DO":
                    resOverview = await DeliveryOrderService
                        .getDOOverview(companyUuid, data.parentDocumentUuid[index], false);
                    break;
                case "GR":
                    resOverview = await GoodsReceiptService
                        .grOverviewDetails(companyUuid, data.parentDocumentUuid[index], false);
                    break;
                case "INV":
                    resOverview = await InvoiceService.getInvOverviewDetails(
                        companyUuid, data.parentDocumentUuid[index], true
                    );
                    break;
                case "PAY":
                    resOverview = await PaymentService.getPaymentOverview(
                        companyUuid, data.parentDocumentUuid[index]
                    );
                    break;
                case "RFQ":
                    resOverview = await RequestForQuotationService.getRFQOverview(
                        companyUuid, data.parentDocumentUuid[index], false
                    );
                    break;
                default:
                    break;
                }
                const dataParent = resOverview ? resOverview.data.data : [];
                if (dataParent.length > 0) {
                    dataParent.forEach((parent) => {
                        newRowData.push({
                            ...parent,
                            type: parent.documentType,
                            documentType: [parent.documentNumber],
                            isChild: true
                        });
                    });
                    if (data.parentDocumentType.length === 1) {
                        newRowData.forEach((row) => {
                            if (row.documentType.find((doc) => doc === data.documentNumber)) {
                                row.hasParent = true;
                                row.documentType = [dataParent[0].documentNumber, ...row.documentType];
                            }
                        });
                    } else if (data.parentDocumentType.length > 1) {
                        newRowData.forEach((row) => {
                            if (row.documentNumber === data.documentNumber) {
                                if (data.documentType.length < 2) {
                                    row.hasParent = true;
                                    row.documentType = [dataParent[0].documentNumber, ...row.documentType];
                                } else {
                                    newRowData.push({ ...row, hasParent: true, documentType: [dataParent[0].documentNumber, row.documentNumber] });
                                }
                            }
                        });
                    }
                }
                newRowData.forEach((row) => {
                    row.loading = false;
                });
                setRowDataOverview(newRowData);
                params.api.setRowData(newRowData);
            });
        } else {
            newRowData.forEach((row) => {
                if (row.documentType.find((doc) => doc === data.documentNumber)) {
                    row.hasParent = true;
                }
                row.loading = false;
            });
            setRowDataOverview(newRowData);
            params.api.setRowData(newRowData);
        }
    };
    const GetChildParent = (params) => {
        const { data } = params;
        return (
            <div className="d-flex align-item-center justify-content-center">
                {
                    (!data.hasParent && data.type !== "PPR" && !data.loading) && (
                        <IconButton
                            size="small"
                            className="mr-2"
                            onClick={() => showParent(params)}
                        >
                            <i className="fa fa-arrow-up" style={{ color: "#AEC57D" }} />
                        </IconButton>
                    )
                }
                {
                    (!data.isChild && data.type !== "PAYMENT BATCH" && !data.loading) && (
                        <IconButton
                            size="small"
                            className="mr-2"
                            onClick={() => showChild(params)}
                        >
                            <i className="fa fa-arrow-down" style={{ color: "#F88686" }} />
                        </IconButton>
                    )
                }
            </div>
        );
    };
    useEffect(() => {
        setRowDataOverview(rowData);
    }, [rowData]);
    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("AuditTrail")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block", padding: 0 }}>
                <Typography component="span" style={{ width: "100%" }}>
                    <Nav tabs className={`mx-0 ${classes["custom-nav"]}`}>
                        <NavItem>
                            <NavLink
                                href="#"
                                className={activeTab === 1 ? "active" : ""}
                                onClick={() => setActiveTab(1)}
                            >
                                <span className="mx-0">
                                    {t("AuditTrail")}
                                </span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#" className={activeTab === 2 ? "active" : ""} onClick={() => setActiveTab(2)}>
                                <span className="mx-0">
                                    {t("Overview")}
                                </span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    {
                        activeTab === 1
                            ? (
                                <Card className={`${classes["custom-card"]}`}>
                                    <CardBody>
                                        <Typography component="span" style={{ width: "100%" }}>
                                            <AgGridTable
                                                columnDefs={AuditTrailDOColDefs}
                                                rowData={rowDataAuditTrail}
                                                sizeColumnsToFit
                                                onComponentStateChanged={(params) => {
                                                    params.api.sizeColumnsToFit();
                                                }}
                                                paginationPageSize={paginationPageSize}
                                                pagination={rowDataAuditTrail.length > 0}
                                                gridHeight={
                                                    rowDataAuditTrail.length > 0
                                                        ? gridHeight
                                                        : 145
                                                }
                                            />
                                        </Typography>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Card className={`${classes["custom-card"]}`}>
                                    <CardBody>
                                        <AgGridTable
                                            className="ag-theme-custom-react"
                                            columnDefs={OverviewColDefs}
                                            colDef={defaultColDef}
                                            rowData={rowDataOverview}
                                            sizeColumnsToFit
                                            onComponentStateChanged={(params) => {
                                                params.api.sizeColumnsToFit();
                                            }}
                                            gridHeight={
                                                rowData.length > 0
                                                    ? gridHeight
                                                    : 145
                                            }
                                            treeData
                                            animateRows
                                            pagination={false}
                                            getDataPath={getDataPath}
                                            autoGroupColumnDef={autoGroupColumnDef}
                                            groupDefaultExpanded={-1}
                                            frameworkComponents={{
                                                LinkCellRenderer,
                                                GetChildParent
                                            }}
                                            context={{ loading: false }}
                                        />
                                    </CardBody>
                                </Card>
                            )
                    }
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default Overview;
