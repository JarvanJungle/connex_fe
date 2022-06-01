import React, { useEffect, useMemo } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useTranslation } from "react-i18next";
import { AgGridReact } from "components/agGrid";
import { Checkbox } from "primereact/checkbox";
import CheckboxRenderer from "routes/components/CheckboxRenderer/checkboxRenderer";
import { useHistory } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";
import classes from "./PaymentInvoicesTable.scss";
import CustomTooltip from "./CustomAddItemDOTooltip";
import PaymentInvoiceColDefs from "./PaymentInvoiceColDefs";
import PAYMENT_ROUTE from "../../route";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    tooltipComponent: "customTooltip"
};

const PaymentInvoicesTable = (props) => {
    const {
        rowData,
        onGridReady,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        onCellValueChanged,
        onChangeCompletedPay,
        onChangeCheckboxHeader,
        handleRemoveRow
    } = props;

    const history = useHistory();

    const { t } = useTranslation();
    const goToIVDetails = (params) => {
        const { data } = params;
        history.push({
            pathname: INVOICE_ROUTES.INV_DETAILS,
            search: `?uuid=${data.invoiceUuid}`
        });
    };

    const LinkCellRenderer = (params) => (
        <div className={classes.linkPo} onClick={() => goToIVDetails(params)} aria-hidden="true">
            {params.data.invoiceNo}
        </div>
    );

    const goToPaymentDetails = (uuid) => {
        history.push({
            pathname: PAYMENT_ROUTE.PAYMENT_DETAILS,
            search: `?uuid=${uuid}`
        });
    };

    const LinkCellRendererPayment = ({ data }) => {
        const { paymentUuidNumber } = data;
        const listPayment = useMemo(() => (typeof paymentUuidNumber === "object"
            ? Object.keys(paymentUuidNumber).map((uuid) => ({
                uuid,
                paymentNo: paymentUuidNumber[uuid]
            }))
            : []),
        [paymentUuidNumber]);

        return (
            <div className="d-flex">
                {
                    listPayment.map(({ uuid, paymentNo }, index) => (
                        <>
                            {index > 0 && ", "}
                            {/* eslint-disable-next-line */}
                            <span key={`${uuid}-${index}`} className={`${classes.linkPo} ml-2`} onClick={() => goToPaymentDetails(uuid)}>
                                {paymentNo}
                            </span>
                        </>
                    ))
                }
            </div>
        );
    };

    const CompletedDelivery = (params) => {
        const { data, agGridReact } = params;
        const rowDataCol = agGridReact?.props?.rowData;
        const { completedPay } = data;
        const { isEdit } = data;
        return (
            <Checkbox
                name="completedPay"
                checked={completedPay}
                disabled={!isEdit}
                onChange={(e) => onChangeCompletedPay(e, rowDataCol, data, params)}
            />
        );
    };

    const CheckboxHeader = (params) => {
        const { agGridReact } = params;
        let checkedHeader;
        let newRowData = [];
        let isEdit = true;
        if (agGridReact) {
            newRowData = [...agGridReact?.props?.rowData];
            if (newRowData.length > 0) {
                newRowData[0].selectAll = true;
                newRowData.forEach((item) => {
                    if (!item.completedPay) {
                        newRowData[0].selectAll = false;
                    }
                });
                if (newRowData[0].selectAll === true) {
                    checkedHeader = true;
                } else {
                    checkedHeader = false;
                }
                if (newRowData[0].isEdit) {
                    isEdit = true;
                } else {
                    isEdit = false;
                }
            }
        }
        return (
            <div className="d-flex justify-content-center align-items-center ml-4">
                {
                    isEdit ? (
                        <Checkbox
                            name="checkHeader"
                            checked={checkedHeader}
                            disabled={!isEdit}
                            onMouseDown={(e) => {
                                onChangeCheckboxHeader(e, newRowData, params);
                            }}
                        />
                    ) : (
                        <Checkbox
                            name="checkHeader"
                            checked={checkedHeader}
                            disabled={!isEdit}
                        />
                    )
                }
                <div className="ml-2">Pay All</div>
            </div>
        );
    };
    
    const viewRenderer = (params) => (
        <IconButton size="small" onClick={() => handleRemoveRow(params)} style={{ color: "red" }}>
            <i className="fa fa-trash" />
        </IconButton>
    );

    const onSelectionChanged = (event) => {
        const selectedNode = event.api.getSelectedNodes();
    };

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("Invoices")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={PaymentInvoiceColDefs}
                    defaultColDef={defaultColDef}
                    rowData={rowData}
                    onGridReady={onGridReady}
                    containerStyle={{ height: gridHeight }}
                    stopEditingWhenCellsLoseFocus
                    frameworkComponents={{
                        viewRenderer,
                        checkboxRenderer: CheckboxRenderer,
                        LinkCellRenderer,
                        customTooltip: CustomTooltip,
                        completedPay: CompletedDelivery,
                        customHeader: CheckboxHeader,
                        LinkCellRendererPayment
                    }}
                    singleClickEdit
                    suppressMenuHide
                    onCellValueChanged={onCellValueChanged}
                    tooltipShowDelay={0}
                    rowSelection="multiple"
                    suppressRowClickSelection
                    onSelectionChanged={onSelectionChanged}
                />
            </AccordionDetails>
        </Accordion>
    );
};

export default PaymentInvoicesTable;
