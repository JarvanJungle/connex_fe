import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Row } from "components";
import { AgGridTable } from "routes/components";
import { formatDisplayDecimal } from "helper/utilities";
import CustomTooltip from "routes/components/AddItemRequest/CustomTooltip";
import CheckboxRenderer from "./CheckboxRender";
import { getQuotationColDefs } from "../../ColumnDefs";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true,
    sortable: true,
    tooltipComponent: "customTooltip"
};

const QuotationToSubmit = (props) => {
    const {
        t,
        borderTopColor = "#AEC57D",
        defaultExpanded = true,
        gridHeight = 350,
        onCellValueChanged,
        onGridReady,
        taxRecords,
        currencies,
        subTotal,
        tax,
        total,
        cellEditingStopped,
        unconnectedSupplier,
        values,
        isBuyer
    } = props;

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("QuotationsToSubmit")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <Typography component="span" style={{ width: "100%" }}>
                    <AgGridTable
                        columnDefs={getQuotationColDefs(
                            taxRecords, currencies, unconnectedSupplier, isBuyer
                        )}
                        gridHeight={gridHeight}
                        onCellValueChanged={onCellValueChanged}
                        cellEditingStopped={cellEditingStopped}
                        colDef={defaultColDef}
                        onGridReady={onGridReady}
                        pagination
                        frameworkComponents={{
                            checkboxRenderer: CheckboxRenderer,
                            customTooltip: CustomTooltip
                        }}
                        autoGroupColumnDef={{
                            headerName: t("ItemCode"),
                            cellRendererParams: { suppressCount: true },
                            width: 160,
                            valueFormatter: (params) => {
                                const { data } = params;
                                if (data?.itemCode.length === 1) {
                                    return data?.itemCode[0];
                                }
                                return "";
                            }
                        }}
                        treeData
                        animateRows
                        groupDefaultExpanded={-1}
                        getDataPath={(data) => data.id}
                        gridOptions={{
                            getRowStyle: (params) => {
                                if (!params?.data?.available
                                    && params?.data?.itemCode?.length === 1
                                ) {
                                    return { background: "#D2D8DE" };
                                }
                                return { background: "#fff" };
                            }
                        }}
                        singleClickEdit
                        stopEditingWhenCellsLoseFocus
                        masterDetail
                    />
                    <Row className="mx-0 mt-2 align-items-end flex-column text-secondary" style={{ fontSize: "1rem" }}>
                        <Row className="justify-content-end mx-0" style={{ textAlign: "right" }}>
                            <div style={{ width: "200px" }}>
                                <div>{`${t("SubTotal")}:`}</div>
                                <div>{`${t("Tax")}:`}</div>
                                <div>{`${t("Total(include GST)")}:`}</div>
                            </div>
                            <div style={{ width: "100px" }}>
                                <div>{values.currencyCode}</div>
                                <div>{values.currencyCode}</div>
                                <div>{values.currencyCode}</div>
                            </div>
                            <div style={{ marginLeft: "40px" }}>
                                <div>{formatDisplayDecimal(subTotal, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(tax, 2) || "0.00"}</div>
                                <div>{formatDisplayDecimal(total, 2) || "0.00"}</div>
                            </div>
                        </Row>
                    </Row>
                </Typography>
            </AccordionDetails>
        </Accordion>
    );
};

export default QuotationToSubmit;
