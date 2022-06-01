import React from "react";
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
import { CREDIT_NOTE_ROUTES } from "routes/P2P/CreditNote";
import classes from "./PaymentInvoicesTable.scss";
import CustomTooltip from "./CustomAddItemDOTooltip";
import PaymentCreditNoteColDefs from "./PaymentCreditNoteColDefs";
import { INVOICE_ROUTES } from "routes/P2P/Invoice";

const defaultColDef = {
    editable: false,
    filter: "agTextColumnFilter",
    floatingFilter: true,
    resizable: true.valueOf,
    tooltipComponent: "customTooltip"
};

const PaymentCreditNoteTable = (props) => {
    const {
        rowData,
        onGridReady,
        gridHeight,
        defaultExpanded,
        borderTopColor,
        onCellValueChanged,
        onChangeApply
    } = props;
    const history = useHistory();

    const { t } = useTranslation();
    const goToCNDetails = (params) => {
        const { data } = params;
        const { cnUuid } = data;
        history.push({
            pathname: CREDIT_NOTE_ROUTES.CN_DETAILS,
            search: `?uuid=${cnUuid}`
        });
    };

    const LinkCellRenderer = (params) => (
        <div className={classes.linkPo} onClick={() => goToCNDetails(params)} aria-hidden="true">
            {params.data.creditNoteNumber}
        </div>
    );

    const goToInvoiceDetails = (params) => {
        const { data } = params;
        const { invoiceUuid } = data;
        history.push({
            pathname: INVOICE_ROUTES.INV_DETAILS,
            search: `?uuid=${invoiceUuid}`
        });
    };

    const LinkCellRendererInvoice = (params) => (
        <div className={classes.linkPo} onClick={() => goToInvoiceDetails(params)} aria-hidden="true">
            {params.data.invoiceNumber}
        </div>
    );

    const CompletedDelivery = (params) => {
        const { data, agGridReact } = params;
        const rowDataCol = agGridReact?.props?.rowData;
        const { apply } = data;
        const { isEdit } = data;
        return (
            <Checkbox
                name="apply"
                checked={apply}
                disabled={!isEdit}
                onChange={(e) => onChangeApply(e, rowDataCol, data, params)}
            />
        );
    };

    const handleRemoveRow = (params) => {
        const rowToDelete = params.node.data;
        params.api.applyTransaction({ remove: [rowToDelete] });
        const arr = [];
        params.api.forEachNode((node) => arr.push(node.data));
    };

    const viewRenderer = (params) => (
        <IconButton size="small" onClick={() => handleRemoveRow(params)} style={{ color: "red" }}>
            <i className="fa fa-trash" />
        </IconButton>
    );

    return (
        <Accordion style={{ borderTop: `8px solid ${borderTopColor}` }} defaultExpanded={defaultExpanded}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography>{t("Credit Note")}</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
                <AgGridReact
                    className="ag-theme-custom-react"
                    columnDefs={PaymentCreditNoteColDefs}
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
                        apply: CompletedDelivery,
                        LinkCellRendererInvoice
                    }}
                    singleClickEdit
                    onCellValueChanged={onCellValueChanged}
                    tooltipShowDelay={0}
                />
            </AccordionDetails>
        </Accordion>
    );
};

export default PaymentCreditNoteTable;
