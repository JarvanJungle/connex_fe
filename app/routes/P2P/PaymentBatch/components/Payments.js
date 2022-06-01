import React from "react";
import { useTranslation } from "react-i18next";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Row } from "components";
import { formatDisplayDecimal } from "helper/utilities";
import { defaultColDef } from "helper/utilities";
import { AgGridReact } from "components/agGrid";
import { Link } from "react-router-dom";
import PAYMENT_ROUTE from "routes/P2P/Payment/route";
import { getTotalTableColDefs, PaymentsItemColDefs } from "../ColumnDefs";

const Payments = (props) => {
    const {
        borderTopColor,
        defaultExpanded,
        gridHeight,
        rowDataItem,
        totalPaymentAmount,
        onCellValueChanged,
        disabled,
        values
    } = props;
    const { t } = useTranslation();

    const PaymentNoRenderer = ({ data }) => (
        <Link to={`${PAYMENT_ROUTE.PAYMENT_DETAILS}?uuid=${data.paymentUuid}`}>
            <span
                style={{
                    color: "#4472C4",
                    textDecoration: "underline"
                }}
            >
                {data.paymentNo}
            </span>
        </Link>
    );
    const DocumentNoRenderer = ({ data }) => (
        <Link to={`${PAYMENT_ROUTE.INV_DETAILS}?uuid=${data.invoiceUuid}`}>
            <span
                style={{
                    color: "#4472C4",
                    textDecoration: "underline"
                }}
            >
                {data.invoiceNo}
            </span>
        </Link>
    );

    const PaymentNumberRenderer = ({ data }) => {
        const { paymentUuidNumber = {} } = data;
        const listPayment = Object.keys(paymentUuidNumber ?? {}).map((paymentUuid) => ({
            uuid: paymentUuid,
            paymentNo: paymentUuidNumber[paymentUuid]
        }));
        return listPayment
            .map(({ uuid, paymentNo }, index) => (
                <>
                    {index > 0 && ", "}
                    {/* eslint-disable-next-line */}
                    <Link key={`${uuid}-${index}`}  to={`${PAYMENT_ROUTE.PAYMENT_DETAILS}?uuid=${uuid}`}
                        style={{ color: "#4472C4", textDecoration: "underline" }}
                        className="ml-2"
                    >
                        {paymentNo}
                    </Link>
                </>
            ));
    };

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            />
            <AccordionDetails style={{ display: "block" }}>
                <Typography component="span" style={{ width: "100%" }}>
                    <div
                        className="ag-theme-custom-react"
                        style={{ height: `${rowDataItem.length === 0 ? 145 : gridHeight}px` }}
                    >
                        <AgGridReact
                            rowData={rowDataItem}
                            defaultColDef={defaultColDef}
                            columnDefs={getTotalTableColDefs(disabled)}
                            masterDetail
                            onGridReady={(params) => {
                                params.api.sizeColumnsToFit();
                            }}
                            isRowMaster={(dataItem) => (dataItem
                                ? dataItem.children.length > 0 : false)}
                            onCellValueChanged={onCellValueChanged}
                            singleClickEdit
                            stopEditingWhenCellsLoseFocus
                            gridOptions={{
                                getRowNodeId: (data) => data.paymentUuid,
                                suppressScrollOnNewData: true,
                                detailCellRendererParams: (masterGridParams) => ({
                                    detailGridOptions: {
                                        columnDefs: PaymentsItemColDefs,
                                        defaultColDef,
                                        suppressScrollOnNewData: true,
                                        immutableData: true,
                                        getRowNodeId: (data) => data.invoiceUuid + data.paymentUuid,
                                        frameworkComponents: {
                                            paymentNoRenderer: PaymentNoRenderer,
                                            invoiceNoRenderer: DocumentNoRenderer,
                                            PaymentNumberRenderer
                                        },
                                        context: {
                                            bankAccount: masterGridParams.node.data.bankAccount
                                        }
                                    },
                                    getDetailRowData: (params) => {
                                        params.successCallback(params.data.children);
                                    }
                                })
                            }}
                        />
                    </div>
                    <Row className="mx-0 align-items-end flex-column mt-3 text-secondary" style={{ fontSize: "1rem" }}>
                        <Row className="justify-content-end mx-0" style={{ width: "600px", textAlign: "right" }}>
                            <div style={{ flexBasis: "75%" }}>
                                <div>{`${t("TotalPaymentBatchAmountToPay")}:`}</div>
                            </div>
                            <div style={{ flexBasis: "10%" }}>
                                <div>{values?.currency}</div>
                            </div>
                            <div style={{ flexBasis: "15%" }}>
                                <div>{formatDisplayDecimal(totalPaymentAmount, 2) || "0.00"}</div>
                            </div>
                        </Row>
                    </Row>
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default Payments;
