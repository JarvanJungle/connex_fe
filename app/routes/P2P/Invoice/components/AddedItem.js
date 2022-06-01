/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from "react";
import { useToast } from "routes/hooks";
import { useTranslation } from "react-i18next";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AgGridTable } from "routes/components";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import { Button, Row, Col } from "components";
import { formatDisplayDecimal } from "helper/utilities";
import { HeaderSecondary } from "routes/components/HeaderSecondary";
import IconButton from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";
import { PURCHASE_ORDER_ROUTES } from "routes/P2P/PurchaseOrder";
import DeliveryOrderService from "services/DeliveryOrderService/DeliveryOrderService";
import { RESPONSE_STATUS } from "helper/constantsDefined";
import {
    SelectItemDOColDefs,
    SelectItemPOColDefs,
    getAddedItemDOColDefs,
    getAddedItemPOColDefs
} from "../ColumnDefs";
import { INVOICE_CONSTANTS } from "../helper";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
    tooltipComponent: "customTooltip"
};

const AddedItem = (props) => {
    const {
        onCellValueChanged,
        borderTopColor,
        defaultExpanded,
        gridHeight,
        rowDataSelect,
        rowDataItem,
        type,
        addItemManual,
        disabled,
        taxRecords,
        uoms,
        invoiceAmount,
        amountToInvoice,
        onSelectionChanged,
        onDeleteItem,
        setGridApiSelectDO,
        setGridApiSelectPO,
        companyUuid,
        isBuyer,
        values
    } = props;
    const showToast = useToast();
    const { t } = useTranslation();
    const [gridApi, setGridApi] = useState(null);

    const viewDOpdf = async (currentCompanyUuid, isBuyer, doUuid) => {
        try {
            let response;
            if (isBuyer) {
                response = await DeliveryOrderService.viewPDFBuyer(
                    currentCompanyUuid, doUuid
                );
            } else {
                response = await DeliveryOrderService.viewPDFSupplier(
                    currentCompanyUuid, doUuid
                );
            }
            if (response.data.status === RESPONSE_STATUS.OK) {
                const { data } = response.data;
                const { url } = data;
                if (url) {
                    window.open(url);
                }
            } else {
                showToast("error", response.data.message || response.data.data);
            }
        } catch (error) {
            showToast("error", error.response ? error.response.data.message : error.message);
        }
    };

    const ActionDelete = (params) => {
        const { data, agGridReact, context } = params;
        const { rowData } = agGridReact.props;
        const { isManualItem } = data;
        return (
            <>
                {isManualItem && (
                    <IconButton
                        size="small"
                        onClick={() => onDeleteItem(data.uuid, rowData, params)}
                        style={{ color: "red" }}
                    >
                        <i className="fa fa-trash" />
                    </IconButton>
                )}
                {!isManualItem && (
                    <>
                        {context?.type === INVOICE_CONSTANTS.DO && (
                            <span
                                style={{
                                    color: "#4472C4",
                                    textDecoration: "underline",
                                    cursor: "pointer"
                                }}
                                onClick={() => viewDOpdf(context?.companyUuid, context?.isBuyer, data?.doUuid)}
                            >
                                <span>{data.doNumber || ""}</span>
                            </span>
                        )}
                        {context?.type === INVOICE_CONSTANTS.PO && (
                            <Link
                                to={{
                                    pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
                                    search: `?uuid=${data.poUuid || data.purchaseOrderUuid}`,
                                    state: { data }
                                }}
                            >
                                <span
                                    style={{
                                        color: "#4472C4",
                                        textDecoration: "underline"
                                    }}
                                >
                                    {data.poNumber || ""}
                                </span>
                            </Link>
                        )}
                    </>
                )}
            </>
        );
    };

    const PONumber = (params) => {
        const { data } = params;
        return (
            <Link
                to={{
                    pathname: PURCHASE_ORDER_ROUTES.PO_DETAILS,
                    search: `?uuid=${data.poUuid || data.purchaseOrderUuid}`,
                    state: { data }
                }}
            >
                <span
                    style={{
                        color: "#4472C4",
                        textDecoration: "underline"
                    }}
                >
                    {data.poNumber}
                </span>
            </Link>
        );
    };

    useEffect(() => {
        if (type && gridApi) gridApi.redrawRows();
    }, [type && gridApi, companyUuid]);

    return (
        <>
            {!disabled && (
                <Accordion
                    style={{ borderTop: `8px solid ${borderTopColor}` }}
                    defaultExpanded={defaultExpanded}
                    className="mb-2"
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{type === INVOICE_CONSTANTS.DO ? t("SelectDO") : t("SelectPO")}</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ display: "block" }}>
                        <Typography component="span" style={{ width: "100%" }}>
                            <AgGridTable
                                className="ag-theme-custom-react"
                                columnDefs={
                                    type === INVOICE_CONSTANTS.DO
                                        ? SelectItemDOColDefs
                                        : SelectItemPOColDefs
                                }
                                colDef={{
                                    ...defaultColDef,
                                    filterParams: { newRowsAction: "keep" }
                                }}
                                rowData={rowDataSelect}
                                gridHeight={rowDataSelect.length === 0 ? 185 : gridHeight}
                                onSelectionChanged={onSelectionChanged}
                                pagination
                                paginationPageSize={10}
                                frameworkComponents={{
                                    customTooltip: CustomTooltip
                                }}
                                onGridReady={(params) => {
                                    if (type === INVOICE_CONSTANTS.DO) {
                                        setGridApiSelectDO(params.api);
                                    }
                                    if (type === INVOICE_CONSTANTS.PO) {
                                        setGridApiSelectPO(params.api);
                                    }
                                }}
                                autoSizeColumn={false}
                            />
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            )}

            {disabled && (
                <HeaderSecondary
                    title={type === INVOICE_CONSTANTS.DO ? t("AddedDO") : t("AddedPO")}
                    className="mb-2"
                />
            )}

            {!disabled && (type === INVOICE_CONSTANTS.DO || type === INVOICE_CONSTANTS.PO) && (
                <Row className="justify-content-between mx-0 mt-3 mb-1">
                    <HeaderSecondary
                        title={type === INVOICE_CONSTANTS.DO ? t("AddedDO") : t("AddedPO")}
                        className="my-2"
                    />
                    <Button
                        color="primary"
                        onClick={() => addItemManual()}
                        style={{ height: 34 }}
                    >
                        <span className="mr-1">+</span>
                        <span>{t("AddManual")}</span>
                    </Button>
                </Row>
            )}

            <AgGridTable
                className="ag-theme-custom-react custom-no-rows-to-show"
                columnDefs={
                    type === INVOICE_CONSTANTS.DO
                        ? getAddedItemDOColDefs(disabled, taxRecords, uoms)
                        : getAddedItemPOColDefs(disabled, taxRecords, uoms)
                }
                onGridReady={(params) => setGridApi(params.api)}
                colDef={defaultColDef}
                rowData={rowDataItem}
                gridHeight={rowDataItem.length === 0 ? 185 : gridHeight}
                stopEditingWhenCellsLoseFocus
                singleClickEdit
                onCellValueChanged={onCellValueChanged}
                tooltipShowDelay={0}
                pagination={false}
                frameworkComponents={{
                    actionDelete: ActionDelete,
                    customTooltip: CustomTooltip,
                    poNumber: PONumber
                }}
                context={{ type, companyUuid }}
                autoSizeColumn={false}
            />

            <Row className="mx-0 justify-content-end mt-2 text-secondary" style={{ fontSize: "1rem" }}>
                <Col lg={4} md={4}>
                    <div style={{ textDecoration: "underline", textAlign: "right" }}>
                        {t("Invoice")}
                    </div>
                    <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                        <div>
                            <div>{`${t("SubTotal")}:`}</div>
                            <div>{`${t("Tax")}:`}</div>
                            <div>{`${t("Total")}:`}</div>
                        </div>
                        <div style={{ minWidth: 100 }}>
                            <div>{values?.currencyCode}</div>
                            <div>{values?.currencyCode}</div>
                            <div>{values?.currencyCode}</div>
                        </div>
                        <div
                            style={{
                                color: Number(invoiceAmount.total).toFixed(2)
                                    - Number(amountToInvoice.total).toFixed(2) === 0
                                    ? "#868E96"
                                    : "red",
                                minWidth: 130
                            }}
                        >
                            <div>{formatDisplayDecimal(invoiceAmount.subTotal, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(invoiceAmount.tax, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(invoiceAmount.total, 2) || "0.00"}</div>
                        </div>
                    </Row>
                </Col>
                <div style={{ padding: "0 15px" }}>
                    <div style={{ textDecoration: "underline", textAlign: "right", marginRight: -15 }}>
                        {t("AmountToInvoice")}
                    </div>
                    <Row className="justify-content-end" style={{ textAlign: "right" }}>
                        <Col
                            xs={12}
                            style={{
                                textAlign: "right",
                                paddingRight: 0,
                                color: Number(invoiceAmount.total).toFixed(2)
                                    - Number(amountToInvoice.total).toFixed(2) === 0
                                    ? "#868E96"
                                    : "red"
                            }}
                        >
                            <div>{formatDisplayDecimal(amountToInvoice.subTotal, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(amountToInvoice.tax, 2) || "0.00"}</div>
                            <div>{formatDisplayDecimal(amountToInvoice.total, 2) || "0.00"}</div>
                        </Col>
                    </Row>
                </div>
            </Row>
        </>
    );
};

export default AddedItem;
